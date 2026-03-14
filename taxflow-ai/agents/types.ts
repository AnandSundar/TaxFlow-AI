/**
 * TaxFlow AI - Agent Types and Interfaces
 * 
 * This module defines the core type definitions for the agent system.
 * These types establish the contract between all agent components.
 * 
 * Architecture Decision:
 * - Using discriminated unions for agent states ensures type-safe state transitions
 * - Generic type parameters allow for flexible agent implementations
 * - Interface segregation separates concerns between different agent capabilities
 */

import { z } from 'zod';

// ============================================================================
// Base Agent Types
// ============================================================================

/**
 * Agent execution status enum
 * Represents the lifecycle states of an agent
 */
export enum AgentStatus {
    IDLE = 'idle',
    RUNNING = 'running',
    WAITING = 'waiting',
    COMPLETED = 'completed',
    FAILED = 'failed',
    CANCELLED = 'cancelled'
}

/**
 * Agent priority levels for scheduling
 */
export enum AgentPriority {
    LOW = 0,
    NORMAL = 1,
    HIGH = 2,
    CRITICAL = 3
}

/**
 * Base agent configuration
 * All agents share this common configuration
 */
export interface AgentConfig {
    /** Unique identifier for the agent */
    id: string;
    /** Human-readable name */
    name: string;
    /** Agent description */
    description: string;
    /** Maximum execution time in milliseconds */
    timeout?: number;
    /** Retry configuration */
    retry?: RetryConfig;
    /** Priority for execution scheduling */
    priority?: AgentPriority;
    /** Custom metadata */
    metadata?: Record<string, unknown>;
}

/**
 * Retry configuration for failed executions
 */
export interface RetryConfig {
    /** Maximum number of retry attempts */
    maxAttempts: number;
    /** Base delay between retries in milliseconds */
    baseDelay: number;
    /** Exponential backoff multiplier */
    backoffMultiplier: number;
    /** Maximum delay between retries */
    maxDelay: number;
}

/**
 * Agent input/output schemas using Zod
 * Enables runtime validation and documentation
 */
export interface AgentSchemas<TInput = unknown, TOutput = unknown> {
    /** Input validation schema */
    input: z.ZodType<TInput>;
    /** Output validation schema */
    output: z.ZodType<TOutput>;
}

// ============================================================================
// Agent Context & State
// ============================================================================

/**
 * Agent execution context
 * Carries state and dependencies through the agent pipeline
 */
export interface AgentContext {
    /** Unique execution ID */
    executionId: string;
    /** Agent ID */
    agentId: string;
    /** Current status */
    status: AgentStatus;
    /** Input data */
    input: unknown;
    /** Output data */
    output?: unknown;
    /** Error if failed */
    error?: AgentError;
    /** Execution metadata */
    metadata: ExecutionMetadata;
    /** Shared memory reference */
    memory: AgentMemory;
    /** Trace context for observability */
    trace: TraceContext;
}

/**
 * Execution metadata tracked throughout agent lifecycle
 */
export interface ExecutionMetadata {
    /** Start timestamp */
    startedAt?: Date;
    /** End timestamp */
    completedAt?: Date;
    /** Duration in milliseconds */
    duration?: number;
    /** Number of tokens consumed */
    tokensConsumed?: number;
    /** Cost in USD */
    cost?: number;
    /** Number of retries */
    retries: number;
    /** Custom execution metrics */
    metrics: Record<string, number>;
}

/**
 * Agent error structure
 */
export interface AgentError {
    /** Error code */
    code: string;
    /** Human-readable message */
    message: string;
    /** Original error */
    cause?: Error;
    /** Stack trace */
    stack?: string;
    /** Whether this error is retryable */
    retryable: boolean;
}

/**
 * Trace context for distributed tracing
 */
export interface TraceContext {
    /** Trace ID for correlation */
    traceId: string;
    /** Span ID for this operation */
    spanId: string;
    /** Parent span ID */
    parentSpanId?: string;
    /** Baggage for trace propagation */
    baggage: Record<string, string>;
}

/**
 * Agent memory interface
 * Provides access to shared context
 */
export interface AgentMemory {
    /** Working memory for current execution */
    working: WorkingMemory;
    /** Episodic memory for historical context */
    episodic: EpisodicMemory;
    /** Semantic memory for knowledge */
    semantic: SemanticMemory;
}

/**
 * Working memory - short-term data during execution
 */
export interface WorkingMemory {
    /** Get a value */
    get<T>(key: string): T | undefined;
    /** Set a value */
    set<T>(key: string, value: T): void;
    /** Delete a value */
    delete(key: string): void;
    /** Check if key exists */
    has(key: string): boolean;
    /** Clear all values */
    clear(): void;
    /** Get all keys */
    keys(): string[];
    /** Get all entries */
    entries(): [string, unknown][];
}

/**
 * Episodic memory - historical execution data
 */
export interface EpisodicMemory {
    /** Add a memory entry */
    add(entry: MemoryEntry): void;
    /** Query memories */
    query(query: MemoryQuery): Promise<MemoryEntry[]>;
    /** Get recent memories */
    recent(limit: number): Promise<MemoryEntry[]>;
}

/**
 * Semantic memory - long-term knowledge
 */
export interface SemanticMemory {
    /** Store a fact */
    store(fact: Fact): void;
    /** Query facts */
    query(query: string): Promise<Fact[]>;
}

/**
 * Memory entry for episodic storage
 */
export interface MemoryEntry {
    id: string;
    timestamp: Date;
    type: string;
    content: unknown;
    importance: number;
    tags: string[];
}

/**
 * Memory query parameters
 */
export interface MemoryQuery {
    type?: string;
    tags?: string[];
    startDate?: Date;
    endDate?: Date;
    importance?: number;
    limit?: number;
}

/**
 * Fact for semantic storage
 */
export interface Fact {
    id: string;
    statement: string;
    confidence: number;
    source: string;
    timestamp: Date;
}

// ============================================================================
// Agent Actions & Results
// ============================================================================

/**
 * Agent action - represents a step the agent can take
 */
export interface AgentAction {
    /** Action type */
    type: string;
    /** Action parameters */
    params: Record<string, unknown>;
    /** Expected outcome */
    expectedOutcome?: string;
}

/**
 * Agent result - outcome of agent execution
 */
export interface AgentResult<T = unknown> {
    /** Whether execution was successful */
    success: boolean;
    /** Output data */
    data?: T;
    /** Error if failed */
    error?: AgentError;
    /** Metadata about the execution */
    metadata: ExecutionMetadata;
    /** Generated actions */
    actions?: AgentAction[];
    /** Recommendations for next steps */
    recommendations?: string[];
}

// ============================================================================
// Tool & Capability Types
// ============================================================================

/**
 * Tool definition
 * Represents a capability the agent can invoke
 */
export interface Tool {
    /** Unique tool identifier */
    id: string;
    /** Tool name */
    name: string;
    /** Tool description */
    description: string;
    /** Input schema */
    inputSchema: z.ZodType<unknown>;
    /** Output schema */
    outputSchema: z.ZodType<unknown>;
    /** Execute the tool */
    execute(input: unknown, context: AgentContext): Promise<unknown>;
    /** Whether tool requires confirmation */
    requiresConfirmation?: boolean;
    /** Tags for categorization */
    tags: string[];
}

/**
 * Tool execution result
 */
export interface ToolResult {
    success: boolean;
    output?: unknown;
    error?: AgentError;
    executionTime: number;
}

/**
 * Available tools for an agent
 */
export interface AgentCapabilities {
    /** Available tools */
    tools: Tool[];
    /** Available models */
    models: ModelConfig[];
    /** Max context length */
    maxContextLength: number;
}

/**
 * Model configuration
 */
export interface ModelConfig {
    id: string;
    name: string;
    provider: string;
    maxTokens: number;
    supportsFunctions: boolean;
    supportsVision: boolean;
    costPer1KTokens: {
        input: number;
        output: number;
    };
}

// ============================================================================
// Event Types
// ============================================================================

/**
 * Agent event for monitoring and debugging
 */
export interface AgentEvent {
    /** Event type */
    type: AgentEventType;
    /** Agent ID */
    agentId: string;
    /** Execution ID */
    executionId: string;
    /** Timestamp */
    timestamp: Date;
    /** Event data */
    data: unknown;
}

/**
 * Agent event type enum
 */
export enum AgentEventType {
    STARTED = 'agent:started',
    COMPLETED = 'agent:completed',
    FAILED = 'agent:failed',
    TOOL_INVOKED = 'agent:tool:invoked',
    TOOL_COMPLETED = 'agent:tool:completed',
    TOOL_FAILED = 'agent:tool:failed',
    RETRY = 'agent:retry',
    WAITING = 'agent:waiting',
    CANCELLED = 'agent:cancelled'
}

/**
 * Event handler type
 */
export type EventHandler<T extends AgentEvent = AgentEvent> = (event: T) => void | Promise<void>;

// ============================================================================
// Factory & Builder Types
// ============================================================================

/**
 * Agent factory function
 */
export type AgentFactory<TConfig extends AgentConfig = AgentConfig, TInput = unknown, TOutput = unknown> = (
    config: TConfig,
    context: AgentContext
) => Agent<TInput, TOutput>;

/**
 * Base agent interface
 */
export interface Agent<TInput = unknown, TOutput = unknown> {
    /** Get agent config */
    getConfig(): AgentConfig;
    /** Execute the agent */
    execute(input: TInput): Promise<AgentResult<TOutput>>;
    /** Validate input */
    validateInput(input: unknown): TInput;
    /** Validate output */
    validateOutput(output: unknown): TOutput;
    /** Get capabilities */
    getCapabilities(): AgentCapabilities;
    /** Subscribe to events */
    on(event: AgentEventType, handler: EventHandler): void;
    /** Unsubscribe from events */
    off(event: AgentEventType, handler: EventHandler): void;
}

/**
 * Agent builder for fluent configuration
 */
export interface AgentBuilder<TInput = unknown, TOutput = unknown> {
    withName(name: string): AgentBuilder<TInput, TOutput>;
    withDescription(description: string): AgentBuilder<TInput, TOutput>;
    withTimeout(timeout: number): AgentBuilder<TInput, TOutput>;
    withRetry(config: RetryConfig): AgentBuilder<TInput, TOutput>;
    withPriority(priority: AgentPriority): AgentBuilder<TInput, TOutput>;
    withTools(tools: Tool[]): AgentBuilder<TInput, TOutput>;
    withModel(model: ModelConfig): AgentBuilder<TInput, TOutput>;
    build(): Agent<TInput, TOutput>;
}
