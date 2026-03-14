/**
 * TaxFlow AI - Tool Registry
 * 
 * Central registry for all tools available to agents.
 * Provides tool discovery, validation, and execution capabilities.
 * 
 * Architecture Decision:
 * - Registry pattern enables dynamic tool discovery
 * - Type-safe tool definitions ensure proper usage
 * - Middleware support for logging and validation
 */

import { Tool, AgentContext, ToolResult } from '../types';

/**
 * Tool registry for managing available tools
 */
export class ToolRegistry {
    private tools: Map<string, Tool> = new Map();
    private middleware: ToolMiddleware[] = [];

    /**
     * Register a tool
     */
    register(tool: Tool): void {
        if (this.tools.has(tool.id)) {
            throw new Error(`Tool already registered: ${tool.id}`);
        }
        this.tools.set(tool.id, tool);
    }

    /**
     * Register multiple tools
     */
    registerMany(tools: Tool[]): void {
        for (const tool of tools) {
            this.register(tool);
        }
    }

    /**
     * Get a tool by ID
     */
    get(toolId: string): Tool | undefined {
        return this.tools.get(toolId);
    }

    /**
     * Get all tools
     */
    getAll(): Tool[] {
        return Array.from(this.tools.values());
    }

    /**
     * Get tools by tag
     */
    getByTag(tag: string): Tool[] {
        return this.getAll().filter(tool => tool.tags.includes(tag));
    }

    /**
     * Check if tool exists
     */
    has(toolId: string): boolean {
        return this.tools.has(toolId);
    }

    /**
     * Unregister a tool
     */
    unregister(toolId: string): boolean {
        return this.tools.delete(toolId);
    }

    /**
     * Add middleware
     */
    use(middleware: ToolMiddleware): void {
        this.middleware.push(middleware);
    }

    /**
     * Execute a tool
     */
    async execute(toolId: string, input: unknown, context: AgentContext): Promise<ToolResult> {
        const tool = this.tools.get(toolId);

        if (!tool) {
            return {
                success: false,
                error: {
                    code: 'TOOL_NOT_FOUND',
                    message: `Tool not found: ${toolId}`,
                    retryable: false
                },
                executionTime: 0
            };
        }

        const startTime = Date.now();

        try {
            // Apply middleware (pre-execution)
            for (const mw of this.middleware) {
                if (mw.onExecute) {
                    input = await mw.onExecute(tool, input, context) || input;
                }
            }

            // Execute tool
            const output = await tool.execute(input, context);

            // Apply middleware (post-execution)
            for (const mw of this.middleware) {
                if (mw.onResult) {
                    output = await mw.onResult(tool, output, context) || output;
                }
            }

            return {
                success: true,
                output,
                executionTime: Date.now() - startTime
            };
        } catch (error) {
            return {
                success: false,
                error: {
                    code: 'TOOL_EXECUTION_ERROR',
                    message: error instanceof Error ? error.message : 'Unknown error',
                    cause: error as Error,
                    retryable: false
                },
                executionTime: Date.now() - startTime
            };
        }
    }

    /**
     * Validate tool input
     */
    validateInput(toolId: string, input: unknown): { valid: boolean; errors?: string[] } {
        const tool = this.tools.get(toolId);
        if (!tool) {
            return { valid: false, errors: ['Tool not found'] };
        }

        try {
            tool.inputSchema.parse(input);
            return { valid: true };
        } catch (error) {
            return {
                valid: false,
                errors: [(error as Error).message]
            };
        }
    }

    /**
     * Get tool descriptions for LLM
     */
    getToolDescriptions(): ToolDescription[] {
        return this.getAll().map(tool => ({
            name: tool.name,
            description: tool.description,
            inputSchema: tool.inputSchema,
            tags: tool.tags
        }));
    }
}

/**
 * Tool middleware interface
 */
export interface ToolMiddleware {
    /** Called before tool execution */
    onExecute?: (tool: Tool, input: unknown, context: AgentContext) => Promise<unknown>;
    /** Called after tool execution */
    onResult?: (tool: Tool, output: unknown, context: AgentContext) => Promise<unknown>;
}

/**
 * Tool description for LLM context
 */
export interface ToolDescription {
    name: string;
    description: string;
    inputSchema: unknown;
    tags: string[];
}

// ============================================================================
// Built-in Tools
// ============================================================================

/**
 * Create tool registry with default tools
 */
export function createDefaultRegistry(): ToolRegistry {
    const registry = new ToolRegistry();

    // Register built-in tools
    registry.registerMany([
        createSearchDocumentsTool(),
        createCalculateTaxTool(),
        createValidateDeductionTool()
    ]);

    return registry;
}

/**
 * Search documents tool
 */
function createSearchDocumentsTool(): Tool {
    return {
        id: 'search-documents',
        name: 'Search Documents',
        description: 'Search for documents in the knowledge base',
        inputSchema: {
            type: 'object',
            properties: {
                query: { type: 'string', description: 'Search query' },
                limit: { type: 'number', description: 'Maximum results' }
            },
            required: ['query']
        },
        outputSchema: {
            type: 'object',
            properties: {
                results: { type: 'array' }
            }
        },
        tags: ['search', 'documents', 'rag'],
        async execute(input: unknown) {
            // Implementation would search vector store
            return { results: [] };
        }
    };
}

/**
 * Calculate tax tool
 */
function createCalculateTaxTool(): Tool {
    return {
        id: 'calculate-tax',
        name: 'Calculate Tax',
        description: 'Calculate estimated tax liability',
        inputSchema: {
            type: 'object',
            properties: {
                income: { type: 'number' },
                deductions: { type: 'number' },
                filingStatus: { type: 'string' }
            },
            required: ['income', 'filingStatus']
        },
        outputSchema: {
            type: 'object',
            properties: {
                tax: { type: 'number' }
            }
        },
        tags: ['tax', 'calculation'],
        async execute(input: unknown) {
            const { income, deductions, filingStatus } = input as {
                income: number;
                deductions: number;
                filingStatus: string;
            };

            const taxableIncome = Math.max(0, income - deductions);
            // Simplified calculation
            const tax = taxableIncome * 0.22; // 22% bracket

            return { tax };
        }
    };
}

/**
 * Validate deduction tool
 */
function createValidateDeductionTool(): Tool {
    return {
        id: 'validate-deduction',
        name: 'Validate Deduction',
        description: 'Check if a deduction is valid for the tax situation',
        inputSchema: {
            type: 'object',
            properties: {
                deductionType: { type: 'string' },
                amount: { type: 'number' },
                income: { type: 'number' }
            },
            required: ['deductionType', 'amount']
        },
        outputSchema: {
            type: 'object',
            properties: {
                valid: { type: 'boolean' },
                reason: { type: 'string' }
            }
        },
        tags: ['tax', 'deduction', 'validation'],
        async execute(input: unknown) {
            const { deductionType, amount, income } = input as {
                deductionType: string;
                amount: number;
                income: number;
            };

            // Simple validation logic
            const valid = amount > 0 && amount <= income;

            return {
                valid,
                reason: valid ? 'Valid deduction' : 'Invalid deduction amount'
            };
        }
    };
}

// ============================================================================
// Logger Middleware Example
// ============================================================================

/**
 * Create logging middleware
 */
export function createLoggingMiddleware(): ToolMiddleware {
    return {
        async onExecute(tool, input, context) {
            console.log(`[Tool] Executing ${tool.name}`, {
                executionId: context.executionId,
                input
            });
            return input;
        },
        async onResult(tool, output, context) {
            console.log(`[Tool] Completed ${tool.name}`, {
                executionId: context.executionId
            });
            return output;
        }
    };
}
