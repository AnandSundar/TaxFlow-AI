/**
 * TaxFlow AI - Base Agent Class
 * 
 * Provides the foundation for all agent implementations in the TaxFlow AI system.
 * Handles common functionality like lifecycle management, tool execution, and event handling.
 * 
 * Architecture Decision:
 * - Abstract base class provides consistent interface for all agents
 * - Template method pattern for execution lifecycle
 * - Hook system for extensibility at key points
 */

import {
    Agent,
    AgentConfig,
    AgentContext,
    AgentResult,
    AgentStatus,
    AgentCapabilities,
    AgentEvent,
    AgentEventType,
    EventHandler,
    Tool,
    ModelConfig,
    RetryConfig,
    TraceContext
} from '../types';

/**
 * Base agent implementation
 * All specific agents should extend this class
 */
export abstract class BaseAgent<TInput = unknown, TOutput = unknown> implements Agent<TInput, TOutput> {
    protected config: AgentConfig;
    protected capabilities: AgentCapabilities;
    protected eventHandlers: Map<AgentEventType, Set<EventHandler>> = new Map();
    protected memory: Map<string, unknown> = new Map();

    constructor(config: AgentConfig) {
        this.config = config;
        this.capabilities = this.initializeCapabilities();
    }

    /**
     * Get agent configuration
     */
    getConfig(): AgentConfig {
        return { ...this.config };
    }

    /**
     * Execute the agent
     * Template method - calls abstract methods for custom behavior
     */
    async execute(input: TInput): Promise<AgentResult<TOutput>> {
        const context = this.createExecutionContext(input);

        try {
            this.emit(AgentEventType.STARTED, {
                type: AgentEventType.STARTED,
                agentId: this.config.id,
                executionId: context.executionId,
                timestamp: new Date(),
                data: input
            });

            // Validate input
            const validatedInput = this.validateInput(input);

            // Pre-execution hook
            await this.beforeExecute(validatedInput, context);

            // Main execution (implemented by subclasses)
            const output = await this.run(validatedInput, context);

            // Validate output
            const validatedOutput = this.validateOutput(output);

            // Post-execution hook
            await this.afterExecute(validatedOutput, context);

            context.status = AgentStatus.COMPLETED;
            context.output = validatedOutput;
            context.metadata.completedAt = new Date();
            context.metadata.duration =
                context.metadata.completedAt.getTime() - context.metadata.startedAt!.getTime();

            this.emit(AgentEventType.COMPLETED, {
                type: AgentEventType.COMPLETED,
                agentId: this.config.id,
                executionId: context.executionId,
                timestamp: new Date(),
                data: validatedOutput
            });

            return {
                success: true,
                data: validatedOutput,
                metadata: context.metadata
            };

        } catch (error) {
            return this.handleError(error as Error, context);
        }
    }

    /**
     * Validate input data
     * Can be overridden for custom validation
     */
    validateInput(input: unknown): TInput {
        return input as TInput;
    }

    /**
     * Validate output data
     * Can be overridden for custom validation
     */
    validateOutput(output: unknown): TOutput {
        return output as TOutput;
    }

    /**
     * Get agent capabilities
     */
    getCapabilities(): AgentCapabilities {
        return { ...this.capabilities };
    }

    /**
     * Subscribe to events
     */
    on(event: AgentEventType, handler: EventHandler): void {
        if (!this.eventHandlers.has(event)) {
            this.eventHandlers.set(event, new Set());
        }
        this.eventHandlers.get(event)!.add(handler);
    }

    /**
     * Unsubscribe from events
     */
    off(event: AgentEventType, handler: EventHandler): void {
        this.eventHandlers.get(event)?.delete(handler);
    }

    // =========================================================================
    // Protected Abstract Methods (to be implemented by subclasses)
    // =========================================================================

    /**
     * Main execution logic
     * Must be implemented by subclasses
     */
    protected abstract run(input: TInput, context: AgentContext): Promise<TOutput>;

    /**
     * Initialize agent capabilities
     * Can be overridden to customize capabilities
     */
    protected initializeCapabilities(): AgentCapabilities {
        return {
            tools: [],
            models: [],
            maxContextLength: 128000
        };
    }

    // =========================================================================
    // Protected Hook Methods (can be overridden by subclasses)
    // =========================================================================

    /**
     * Hook called before main execution
     */
    protected async beforeExecute(input: TInput, context: AgentContext): Promise<void> {
        // Default implementation - can be overridden
    }

    /**
     * Hook called after successful execution
     */
    protected async afterExecute(output: TOutput, context: AgentContext): Promise<void> {
        // Default implementation - can be overridden
    }

    /**
     * Hook called on execution error
     */
    protected async onError(error: Error, context: AgentContext): Promise<void> {
        // Default implementation - can be overridden
    }

    // =========================================================================
    // Protected Helper Methods
    // =========================================================================

    /**
     * Create execution context
     */
    protected createExecutionContext(input: TInput): AgentContext {
        return {
            executionId: this.generateId(),
            agentId: this.config.id,
            status: AgentStatus.RUNNING,
            input,
            metadata: {
                retries: 0,
                metrics: {}
            },
            memory: {
                working: {
                    get: <T>(key: string) => this.memory.get(key) as T | undefined,
                    set: <T>(key: string, value: T) => this.memory.set(key, value),
                    delete: (key: string) => this.memory.delete(key),
                    has: (key: string) => this.memory.has(key),
                    clear: () => this.memory.clear(),
                    keys: () => Array.from(this.memory.keys()),
                    entries: () => Array.from(this.memory.entries())
                },
                episodic: {
                    add: async () => { },
                    query: async () => [],
                    recent: async () => []
                },
                semantic: {
                    store: async () => { },
                    query: async () => []
                }
            },
            trace: {
                traceId: this.generateId(),
                spanId: this.generateId(),
                baggage: {}
            }
        };
    }

    /**
     * Handle execution error with retry logic
     */
    protected async handleError(error: Error, context: AgentContext): Promise<AgentResult<TOutput>> {
        const retryConfig = this.config.retry;
        const maxRetries = retryConfig?.maxAttempts || 0;

        context.metadata.retries++;
        context.error = {
            code: error.name,
            message: error.message,
            cause: error,
            stack: error.stack,
            retryable: context.metadata.retries < maxRetries
        };

        // Check if we should retry
        if (context.error.retryable && retryConfig) {
            const delay = this.calculateRetryDelay(
                context.metadata.retries,
                retryConfig.baseDelay,
                retryConfig.backoffMultiplier,
                retryConfig.maxDelay
            );

            this.emit(AgentEventType.RETRY, {
                type: AgentEventType.RETRY,
                agentId: this.config.id,
                executionId: context.executionId,
                timestamp: new Date(),
                data: { retry: context.metadata.retries, delay }
            });

            await this.sleep(delay);
            return this.execute(context.input as TInput);
        }

        context.status = AgentStatus.FAILED;
        context.metadata.completedAt = new Date();

        await this.onError(error, context);

        this.emit(AgentEventType.FAILED, {
            type: AgentEventType.FAILED,
            agentId: this.config.id,
            executionId: context.executionId,
            timestamp: new Date(),
            data: { error: context.error }
        });

        return {
            success: false,
            error: context.error,
            metadata: context.metadata
        };
    }

    /**
     * Calculate retry delay with exponential backoff
     */
    private calculateRetryDelay(
        attempt: number,
        baseDelay: number,
        multiplier: number,
        maxDelay: number
    ): number {
        const delay = Math.min(
            baseDelay * Math.pow(multiplier, attempt - 1),
            maxDelay
        );
        return delay;
    }

    /**
     * Execute a tool
     */
    protected async executeTool(tool: Tool, input: unknown, context: AgentContext): Promise<unknown> {
        this.emit(AgentEventType.TOOL_INVOKED, {
            type: AgentEventType.TOOL_INVOKED,
            agentId: this.config.id,
            executionId: context.executionId,
            timestamp: new Date(),
            data: { toolId: tool.id, input }
        });

        try {
            const startTime = Date.now();
            const output = await tool.execute(input, context);
            const executionTime = Date.now() - startTime;

            this.emit(AgentEventType.TOOL_COMPLETED, {
                type: AgentEventType.TOOL_COMPLETED,
                agentId: this.config.id,
                executionId: context.executionId,
                timestamp: new Date(),
                data: { toolId: tool.id, executionTime }
            });

            return output;
        } catch (error) {
            this.emit(AgentEventType.TOOL_FAILED, {
                type: AgentEventType.TOOL_FAILED,
                agentId: this.config.id,
                executionId: context.executionId,
                timestamp: new Date(),
                data: { toolId: tool.id, error }
            });
            throw error;
        }
    }

    /**
     * Emit an event
     */
    protected emit(type: AgentEventType, event: AgentEvent): void {
        const handlers = this.eventHandlers.get(type);
        if (handlers) {
            handlers.forEach(handler => {
                try {
                    handler(event);
                } catch (error) {
                    console.error(`Event handler error for ${type}:`, error);
                }
            });
        }
    }

    /**
     * Generate unique ID
     */
    protected generateId(): string {
        return `${this.config.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Sleep for specified milliseconds
     */
    protected sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Set a value in working memory
     */
    protected setMemory<T>(key: string, value: T): void {
        this.memory.set(key, value);
    }

    /**
     * Get a value from working memory
     */
    protected getMemory<T>(key: string): T | undefined {
        return this.memory.get(key) as T | undefined;
    }
}

/**
 * Agent builder for fluent configuration
 */
export class AgentBuilder<TInput = unknown, TOutput = unknown> {
    private config: Partial<AgentConfig> = {
        metadata: {},
        priority: 1,
        retry: {
            maxAttempts: 3,
            baseDelay: 1000,
            backoffMultiplier: 2,
            maxDelay: 30000
        }
    };
    private capabilities: Partial<AgentCapabilities> = {
        tools: [],
        models: [],
        maxContextLength: 128000
    };

    withName(name: string): AgentBuilder<TInput, TOutput> {
        this.config.name = name;
        return this;
    }

    withDescription(description: string): AgentBuilder<TInput, TOutput> {
        this.config.description = description;
        return this;
    }

    withTimeout(timeout: number): AgentBuilder<TInput, TOutput> {
        this.config.timeout = timeout;
        return this;
    }

    withRetry(config: RetryConfig): AgentBuilder<TInput, TOutput> {
        this.config.retry = config;
        return this;
    }

    withTools(tools: Tool[]): AgentBuilder<TInput, TOutput> {
        this.capabilities.tools = tools;
        return this;
    }

    withModel(model: ModelConfig): AgentBuilder<TInput, TOutput> {
        this.capabilities.models = [model];
        return this;
    }

    withPriority(priority: number): AgentBuilder<TInput, TOutput> {
        this.config.priority = priority as any;
        return this;
    }

    build(): Agent<TInput, TOutput> {
        if (!this.config.id || !this.config.name || !this.config.description) {
            throw new Error('Agent configuration is incomplete');
        }
        // Return a basic agent instance (in practice, you'd return a subclass)
        throw new Error('Use a specific agent class');
    }
}

/**
 * Factory function to create base agent config
 */
export function createAgentConfig(
    id: string,
    name: string,
    description: string
): AgentConfig {
    return {
        id,
        name,
        description,
        timeout: 60000,
        retry: {
            maxAttempts: 3,
            baseDelay: 1000,
            backoffMultiplier: 2,
            maxDelay: 30000
        }
    };
}
