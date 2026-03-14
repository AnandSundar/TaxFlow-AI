/**
 * TaxFlow AI - Agent Graph Execution Engine
 * 
 * Implements the core graph orchestration engine for executing
 * complex multi-agent workflows with support for parallel execution,
 * conditional routing, and human-in-the-loop interactions.
 * 
 * Architecture Decision:
 * - Event-driven architecture enables real-time monitoring and debugging
 * - Promise-based execution model supports both sync and async nodes
 * - State machine pattern manages execution lifecycle
 */

import {
    GraphDefinition,
    GraphNodeConfig,
    GraphEdge,
    GraphExecution,
    ExecutionStatus,
    NodeExecution,
    NodeType,
    EdgeType,
    EdgeCondition,
    GraphExecutor,
    GraphExecutionEvent,
    ParallelConfig,
    ParallelStrategy,
    HumanReviewRequest,
    HumanReviewType,
    RouterConfig,
    RouterType,
    ConditionType,
    ComparisonOperator
} from './types';
import { AgentContext, AgentResult, AgentStatus, AgentEvent, AgentEventType } from '../types';

/**
 * Graph execution engine
 * Handles the execution of agent graphs
 */
export class GraphEngine implements GraphExecutor {
    private graphs: Map<string, GraphDefinition> = new Map();
    private executions: Map<string, GraphExecution> = new Map();
    private nodeExecutors: Map<NodeType, NodeExecutor> = new Map();
    private eventHandlers: Map<GraphExecutionEvent, Set<Function>> = new Map();
    private humanReviewCallbacks: Map<string, (response: unknown) => void> = new Map();

    constructor() {
        // Register default node executors
        this.registerDefaultExecutors();
    }

    /**
     * Register a graph definition
     */
    registerGraph(graph: GraphDefinition): void {
        this.graphs.set(graph.id, graph);
    }

    /**
     * Get a registered graph
     */
    getGraph(graphId: string): GraphDefinition | undefined {
        return this.graphs.get(graphId);
    }

    /**
     * Execute a graph
     */
    async execute(input: unknown, context?: Partial<AgentContext>): Promise<GraphExecution> {
        const graphId = context?.agentId || 'default';
        const graph = this.graphs.get(graphId);

        if (!graph) {
            throw new Error(`Graph not found: ${graphId}`);
        }

        // Create execution context
        const execution: GraphExecution = {
            id: this.generateId(),
            graphId: graph.id,
            graphVersion: graph.version,
            status: ExecutionStatus.RUNNING,
            input,
            nodeExecutions: new Map(),
            metadata: {
                nodesExecuted: 0,
                nodesFailed: 0,
                startedAt: new Date()
            }
        };

        this.executions.set(execution.id, execution);
        this.emit(GraphExecutionEvent.EXECUTION_STARTED, execution);

        try {
            // Find start nodes
            const startNodes = graph.nodes.filter(n => n.type === NodeType.START);

            if (startNodes.length === 0) {
                throw new Error('Graph has no start node');
            }

            // Execute from start node
            const result = await this.executeNodeChain(
                graph,
                startNodes[0].id,
                input,
                execution,
                context
            );

            execution.output = result;
            execution.status = ExecutionStatus.COMPLETED;
            execution.metadata.completedAt = new Date();
            execution.metadata.duration =
                execution.metadata.completedAt.getTime() - execution.metadata.startedAt!.getTime();

            this.emit(GraphExecutionEvent.EXECUTION_COMPLETED, execution);

        } catch (error) {
            execution.status = ExecutionStatus.FAILED;
            execution.error = error as Error;
            execution.metadata.completedAt = new Date();
            this.emit(GraphExecutionEvent.EXECUTION_FAILED, execution);
        }

        return execution;
    }

    /**
     * Resume execution from a paused state
     */
    async resume(executionId: string, input: unknown): Promise<GraphExecution> {
        const execution = this.executions.get(executionId);

        if (!execution) {
            throw new Error(`Execution not found: ${executionId}`);
        }

        if (execution.status !== ExecutionStatus.WAITING_FOR_INPUT) {
            throw new Error(`Execution is not waiting for input: ${execution.status}`);
        }

        const graph = this.graphs.get(execution.graphId);
        if (!graph) {
            throw new Error(`Graph not found: ${execution.graphId}`);
        }

        execution.status = ExecutionStatus.RUNNING;
        const activeNode = execution.activeNode!;

        try {
            const result = await this.executeNodeChain(
                graph,
                activeNode,
                input,
                execution
            );

            execution.output = result;
            execution.status = ExecutionStatus.COMPLETED;
            this.emit(GraphExecutionEvent.EXECUTION_COMPLETED, execution);
        } catch (error) {
            execution.status = ExecutionStatus.FAILED;
            execution.error = error as Error;
            this.emit(GraphExecutionEvent.EXECUTION_FAILED, execution);
        }

        return execution;
    }

    /**
     * Cancel execution
     */
    async cancel(executionId: string): Promise<void> {
        const execution = this.executions.get(executionId);

        if (!execution) {
            throw new Error(`Execution not found: ${executionId}`);
        }

        if (execution.status === ExecutionStatus.COMPLETED ||
            execution.status === ExecutionStatus.FAILED ||
            execution.status === ExecutionStatus.CANCELLED) {
            return;
        }

        execution.status = ExecutionStatus.CANCELLED;
        execution.metadata.completedAt = new Date();
    }

    /**
     * Get execution status
     */
    getExecution(executionId: string): GraphExecution | undefined {
        return this.executions.get(executionId);
    }

    /**
     * Subscribe to execution events
     */
    on(event: GraphExecutionEvent, handler: Function): void {
        if (!this.eventHandlers.has(event)) {
            this.eventHandlers.set(event, new Set());
        }
        this.eventHandlers.get(event)!.add(handler);
    }

    /**
     * Unsubscribe from events
     */
    off(event: GraphExecutionEvent, handler: Function): void {
        this.eventHandlers.get(event)?.delete(handler);
    }

    // =========================================================================
    // Private Methods
    // =========================================================================

    /**
     * Register default node executors
     */
    private registerDefaultExecutors(): void {
        this.nodeExecutors.set(NodeType.AGENT, this.executeAgentNode.bind(this));
        this.nodeExecutors.set(NodeType.TOOL, this.executeToolNode.bind(this));
        this.nodeExecutors.set(NodeType.CONDITIONAL, this.executeConditionalNode.bind(this));
        this.nodeExecutors.set(NodeType.PARALLEL, this.executeParallelNode.bind(this));
        this.nodeExecutors.set(NodeType.ROUTER, this.executeRouterNode.bind(this));
        this.nodeExecutors.set(NodeType.HUMAN_REVIEW, this.executeHumanReviewNode.bind(this));
        this.nodeExecutors.set(NodeType.START, this.executeStartNode.bind(this));
        this.nodeExecutors.set(NodeType.END, this.executeEndNode.bind(this));
    }

    /**
     * Execute a chain of nodes following edges
     */
    private async executeNodeChain(
        graph: GraphDefinition,
        startNodeId: string,
        input: unknown,
        execution: GraphExecution,
        context?: Partial<AgentContext>
    ): Promise<unknown> {
        let currentNodeId = startNodeId;
        let currentInput = input;
        let result: unknown;

        while (currentNodeId) {
            const node = graph.nodes.find(n => n.id === currentNodeId);

            if (!node) {
                throw new Error(`Node not found: ${currentNodeId}`);
            }

            execution.activeNode = currentNodeId;

            // Execute the node
            const nodeResult = await this.executeNode(
                node,
                currentInput,
                execution,
                context
            );

            result = nodeResult.output;

            // Update node execution state
            execution.nodeExecutions.set(currentNodeId, nodeResult);

            // Handle human review pause
            if (nodeResult.status === AgentStatus.WAITING) {
                execution.status = ExecutionStatus.WAITING_FOR_INPUT;
                return result;
            }

            // Find next node based on edges
            const nextEdge = this.findNextEdge(graph, currentNodeId, nodeResult, execution);

            if (!nextEdge) {
                break;
            }

            currentNodeId = nextEdge.target;
            currentInput = this.applyOutputMapping(graph, currentNodeId, result, execution);
        }

        return result;
    }

    /**
     * Execute a single node
     */
    private async executeNode(
        node: GraphNodeConfig,
        input: unknown,
        execution: GraphExecution,
        context?: Partial<AgentContext>
    ): Promise<NodeExecution> {
        const nodeExecution: NodeExecution = {
            nodeId: node.id,
            nodeType: node.type,
            status: AgentStatus.RUNNING,
            input,
            retries: 0,
            order: execution.metadata.nodesExecuted,
            startedAt: new Date()
        };

        this.emit(GraphExecutionEvent.NODE_STARTED, {
            nodeId: node.id,
            executionId: execution.id
        });

        try {
            const executor = this.nodeExecutors.get(node.type);

            if (!executor) {
                throw new Error(`No executor for node type: ${node.type}`);
            }

            const result = await executor(node, input, execution, context);
            nodeExecution.output = result;
            nodeExecution.status = AgentStatus.COMPLETED;

            execution.metadata.nodesExecuted++;

            this.emit(GraphExecutionEvent.NODE_COMPLETED, {
                nodeId: node.id,
                executionId: execution.id,
                output: result
            });

        } catch (error) {
            nodeExecution.status = AgentStatus.FAILED;
            nodeExecution.error = error as Error;
            execution.metadata.nodesFailed++;

            this.emit(GraphExecutionEvent.NODE_FAILED, {
                nodeId: node.id,
                executionId: execution.id,
                error: error
            });
        }

        nodeExecution.completedAt = new Date();
        nodeExecution.duration =
            nodeExecution.completedAt.getTime() - nodeExecution.startedAt.getTime();

        return nodeExecution;
    }

    /**
     * Find next edge based on conditions
     */
    private findNextEdge(
        graph: GraphDefinition,
        currentNodeId: string,
        nodeResult: NodeExecution,
        execution: GraphExecution
    ): GraphEdge | undefined {
        const outgoingEdges = graph.edges.filter(e => e.source === currentNodeId);

        for (const edge of outgoingEdges) {
            if (this.evaluateEdgeCondition(edge, nodeResult, execution)) {
                this.emit(GraphExecutionEvent.EDGE_traversed, {
                    edgeId: edge.id,
                    executionId: execution.id
                });
                return edge;
            }
        }

        return undefined;
    }

    /**
     * Evaluate edge condition
     */
    private evaluateEdgeCondition(
        edge: GraphEdge,
        nodeResult: NodeExecution,
        execution: GraphExecution
    ): boolean {
        switch (edge.type) {
            case EdgeType.UNCONDITIONAL:
                return true;

            case EdgeType.SUCCESS:
                return nodeResult.status === AgentStatus.COMPLETED;

            case EdgeType.FAILURE:
                return nodeResult.status === AgentStatus.FAILED;

            case EdgeType.CONDITIONAL:
                if (!edge.condition) return true;
                return this.evaluateCondition(edge.condition, nodeResult, execution);

            default:
                return true;
        }
    }

    /**
     * Evaluate a condition
     */
    private evaluateCondition(
        condition: EdgeCondition,
        nodeResult: NodeExecution,
        execution: GraphExecution
    ): boolean {
        switch (condition.type) {
            case ConditionType.ALWAYS:
                return true;

            case ConditionType.NEVER:
                return false;

            case ConditionType.EXPRESSION:
                if (!condition.expression) return true;
                try {
                    // Create a safe evaluation context
                    const context = {
                        input: execution.input,
                        output: nodeResult.output,
                        status: nodeResult.status,
                        error: nodeResult.error,
                        metadata: execution.metadata
                    };
                    // Note: In production, use a proper expression parser
                    return new Function('ctx', `with(ctx) { return ${condition.expression} }`)(context);
                } catch {
                    return false;
                }

            case ConditionType.FIELD:
                if (!condition.field || !condition.operator) return true;
                const value = this.getFieldValue(nodeResult.output, condition.field);
                return this.compareValues(value, condition.operator, condition.expected);

            default:
                return true;
        }
    }

    /**
     * Get field value using JSONPath-like syntax
     */
    private getFieldValue(obj: unknown, path: string): unknown {
        const parts = path.split('.');
        let current: unknown = obj;

        for (const part of parts) {
            if (current === null || current === undefined) return undefined;

            // Handle array access
            const arrayMatch = part.match(/^(\w+)\[(\d+)\]$/);
            if (arrayMatch) {
                current = (current as Record<string, unknown[]>)[arrayMatch[1]];
                current = Array.isArray(current) ? current[parseInt(arrayMatch[2])] : undefined;
            } else {
                current = (current as Record<string, unknown>)[part];
            }
        }

        return current;
    }

    /**
     * Compare values using operator
     */
    private compareValues(actual: unknown, operator: ComparisonOperator, expected: unknown): boolean {
        switch (operator) {
            case ComparisonOperator.EQUALS:
                return actual === expected;
            case ComparisonOperator.NOT_EQUALS:
                return actual !== expected;
            case ComparisonOperator.GREATER_THAN:
                return Number(actual) > Number(expected);
            case ComparisonOperator.LESS_THAN:
                return Number(actual) < Number(expected);
            case ComparisonOperator.GREATER_EQUALS:
                return Number(actual) >= Number(expected);
            case ComparisonOperator.LESS_EQUALS:
                return Number(actual) <= Number(expected);
            case ComparisonOperator.CONTAINS:
                return String(actual).includes(String(expected));
            case ComparisonOperator.IN:
                return Array.isArray(expected) && expected.includes(actual);
            case ComparisonOperator.IS_NULL:
                return actual === null || actual === undefined;
            case ComparisonOperator.IS_NOT_NULL:
                return actual !== null && actual !== undefined;
            default:
                return true;
        }
    }

    /**
     * Apply output mapping
     */
    private applyOutputMapping(
        graph: GraphDefinition,
        targetNodeId: string,
        output: unknown,
        execution: GraphExecution
    ): unknown {
        const targetNode = graph.nodes.find(n => n.id === targetNodeId);
        if (!targetNode?.inputMapping) return output;

        const mapped: Record<string, unknown> = {};

        for (const mapping of targetNode.inputMapping!) {
            if (mapping.sourceNode && execution.nodeExecutions.has(mapping.sourceNode)) {
                const sourceExecution = execution.nodeExecutions.get(mapping.sourceNode)!;
                const value = this.getFieldValue(sourceExecution.output, mapping.sourceField);
                mapped[mapping.targetField] = value;
            } else if (!mapping.sourceNode) {
                const value = this.getFieldValue(output, mapping.sourceField);
                mapped[mapping.targetField] = value;
            }
        }

        return { ...(output as Record<string, unknown>), ...mapped };
    }

    // =========================================================================
    // Node Executors
    // =========================================================================

    private async executeAgentNode(
        node: GraphNodeConfig,
        input: unknown,
        execution: GraphExecution,
        context?: Partial<AgentContext>
    ): Promise<unknown> {
        // In a full implementation, this would invoke the actual agent
        // For now, return a placeholder
        return {
            success: true,
            nodeId: node.id,
            input,
            message: 'Agent node executed'
        };
    }

    private async executeToolNode(
        node: GraphNodeConfig,
        input: unknown,
        execution: GraphExecution,
        context?: Partial<AgentContext>
    ): Promise<unknown> {
        return { success: true, nodeId: node.id, input };
    }

    private async executeConditionalNode(
        node: GraphNodeConfig,
        input: unknown,
        execution: GraphExecution,
        context?: Partial<AgentContext>
    ): Promise<unknown> {
        const condition = node.config?.condition as EdgeCondition | undefined;
        if (!condition) return { result: true };

        const result = this.evaluateCondition(condition, { output: input } as NodeExecution, execution);
        return { result, input };
    }

    private async executeParallelNode(
        node: GraphNodeConfig,
        input: unknown,
        execution: GraphExecution,
        context?: Partial<AgentContext>
    ): Promise<unknown> {
        const config = node.config as ParallelConfig | undefined;
        const strategy = config?.strategy || ParallelStrategy.PARALLEL;

        // Get parallel node targets
        const edges = Array.from(this.graphs.get(execution.graphId)?.edges || [])
            .filter(e => e.source === node.id);

        if (strategy === ParallelStrategy.PARALLEL) {
            const promises = edges.map(edge =>
                this.executeNodeChain(
                    this.graphs.get(execution.graphId)!,
                    edge.target,
                    input,
                    execution,
                    context
                )
            );
            return Promise.all(promises);
        }

        // Sequential execution
        let result = input;
        for (const edge of edges) {
            result = await this.executeNodeChain(
                this.graphs.get(execution.graphId)!,
                edge.target,
                result,
                execution,
                context
            );
        }
        return result;
    }

    private async executeRouterNode(
        node: GraphNodeConfig,
        input: unknown,
        execution: GraphExecution,
        context?: Partial<AgentContext>
    ): Promise<unknown> {
        const config = node.config as RouterConfig | undefined;
        if (!config) return { targetNode: undefined };

        // Simple routing based on input type
        const routes = config.routes;
        const selectedRoute = routes[0]; // Default to first route

        return {
            targetNode: selectedRoute?.targetNode,
            route: selectedRoute?.name
        };
    }

    private async executeHumanReviewNode(
        node: GraphNodeConfig,
        input: unknown,
        execution: GraphExecution,
        context?: Partial<AgentContext>
    ): Promise<unknown> {
        const request: HumanReviewRequest = {
            id: this.generateId(),
            executionId: execution.id,
            nodeId: node.id,
            type: HumanReviewType.APPROVAL,
            content: input,
            questions: ['Please review and approve this output'],
            deadline: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
        };

        // Return a promise that resolves when human provides input
        return new Promise((resolve) => {
            this.humanReviewCallbacks.set(request.id, (response: unknown) => {
                resolve({ reviewResponse: response, requestId: request.id });
            });
        });
    }

    private async executeStartNode(
        node: GraphNodeConfig,
        input: unknown,
        execution: GraphExecution,
        context?: Partial<AgentContext>
    ): Promise<unknown> {
        return input;
    }

    private async executeEndNode(
        node: GraphNodeConfig,
        input: unknown,
        execution: GraphExecution,
        context?: Partial<AgentContext>
    ): Promise<unknown> {
        return input;
    }

    // =========================================================================
    // Event Emission
    // =========================================================================

    private emit(event: GraphExecutionEvent, data: unknown): void {
        const handlers = this.eventHandlers.get(event);
        if (handlers) {
            handlers.forEach(handler => {
                try {
                    handler(data);
                } catch (error) {
                    console.error(`Event handler error for ${event}:`, error);
                }
            });
        }
    }

    // =========================================================================
    // Utilities
    // =========================================================================

    private generateId(): string {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
}

/**
 * Node executor function type
 */
type NodeExecutor = (
    node: GraphNodeConfig,
    input: unknown,
    execution: GraphExecution,
    context?: Partial<AgentContext>
) => Promise<unknown>;

/**
 * Create a new graph engine instance
 */
export function createGraphEngine(): GraphEngine {
    return new GraphEngine();
}
