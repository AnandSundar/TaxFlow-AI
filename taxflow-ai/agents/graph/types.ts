/**
 * TaxFlow AI - Graph Node Types
 * 
 * Defines the types for the agent graph orchestration system.
 * This enables complex multi-agent workflows with conditional execution.
 * 
 * Architecture Decision:
 * - Node-based graph structure provides flexibility for complex workflows
 * - Conditional edges enable dynamic routing based on execution results
 * - Support for both synchronous and asynchronous node execution
 */

import { AgentContext, AgentResult, AgentStatus, Tool } from '../types';

// ============================================================================
// Graph Structure Types
// ============================================================================

/**
 * Graph node configuration
 */
export interface GraphNodeConfig {
    /** Unique node identifier */
    id: string;
    /** Node type */
    type: NodeType;
    /** Node name */
    name: string;
    /** Node description */
    description: string;
    /** Agent configuration */
    agent?: NodeAgentConfig;
    /** Node-specific configuration */
    config?: Record<string, unknown>;
    /** Input mapping from previous nodes */
    inputMapping?: InputMapping[];
    /** Output mapping to next nodes */
    outputMapping?: OutputMapping[];
}

/**
 * Node agent configuration
 */
export interface NodeAgentConfig {
    /** Agent type/identifier */
    agentType: string;
    /** Agent version */
    version?: string;
    /** Model to use */
    model?: string;
    /** Tools available to this agent */
    tools?: string[];
    /** System prompt override */
    systemPrompt?: string;
    /** Temperature setting */
    temperature?: number;
    /** Max tokens */
    maxTokens?: number;
}

/**
 * Node type enum
 */
export enum NodeType {
    /** Agent node - executes an agent */
    AGENT = 'agent',
    /** Tool node - executes a tool directly */
    TOOL = 'tool',
    /** Conditional node - routes based on condition */
    CONDITIONAL = 'conditional',
    /** Parallel node - executes multiple nodes concurrently */
    PARALLEL = 'parallel',
    /** Map node - executes node for each item in array */
    MAP = 'map',
    /** Reduce node - aggregates results from multiple nodes */
    REDUCE = 'reduce',
    /** Router node - selects next node based on input */
    ROUTER = 'router',
    /** Human review node - requires human input */
    HUMAN_REVIEW = 'human_review',
    /** Start node - entry point */
    START = 'start',
    /** End node - termination point */
    END = 'end'
}

/**
 * Input mapping from previous node outputs
 */
export interface InputMapping {
    /** Source node ID */
    sourceNode: string;
    /** Source output field (JSONPath) */
    sourceField: string;
    /** Target input field */
    targetField: string;
    /** Transform function */
    transform?: string;
}

/**
 * Output mapping to next node inputs
 */
export interface OutputMapping {
    /** Target node ID */
    targetNode: string;
    /** Source output field */
    sourceField: string;
    /** Target input field */
    targetField: string;
    /** Whether this mapping is conditional */
    conditional?: boolean;
    /** Condition expression */
    condition?: string;
}

// ============================================================================
// Edge Types
// ============================================================================

/**
 * Graph edge configuration
 */
export interface GraphEdge {
    /** Unique edge identifier */
    id: string;
    /** Source node ID */
    source: string;
    /** Target node ID */
    target: string;
    /** Edge type */
    type: EdgeType;
    /** Edge condition */
    condition?: EdgeCondition;
    /** Edge metadata */
    metadata?: Record<string, unknown>;
}

/**
 * Edge type enum
 */
export enum EdgeType {
    /** Unconditional edge */
    UNCONDITIONAL = 'unconditional',
    /** Conditional edge - follows condition */
    CONDITIONAL = 'conditional',
    /** Success edge - follows on success */
    SUCCESS = 'success',
    /** Failure edge - follows on failure */
    FAILURE = 'failure',
    /** Timeout edge - follows on timeout */
    TIMEOUT = 'timeout',
    /** Default fallback edge */
    DEFAULT = 'default'
}

/**
 * Edge condition definition
 */
export interface EdgeCondition {
    /** Condition type */
    type: ConditionType;
    /** Condition expression (JS expression) */
    expression?: string;
    /** JSONPath to evaluate */
    field?: string;
    /** Expected value for comparison */
    expected?: unknown;
    /** Operator for comparison */
    operator?: ComparisonOperator;
    /** Custom condition function */
    function?: string;
}

/**
 * Condition types
 */
export enum ConditionType {
    EXPRESSION = 'expression',
    FIELD = 'field',
    FUNCTION = 'function',
    ALWAYS = 'always',
    NEVER = 'never'
}

/**
 * Comparison operators
 */
export enum ComparisonOperator {
    EQUALS = 'eq',
    NOT_EQUALS = 'neq',
    GREATER_THAN = 'gt',
    LESS_THAN = 'lt',
    GREATER_EQUALS = 'gte',
    LESS_EQUALS = 'lte',
    CONTAINS = 'contains',
    STARTS_WITH = 'startsWith',
    ENDS_WITH = 'endsWith',
    IN = 'in',
    NOT_IN = 'notIn',
    IS_NULL = 'isNull',
    IS_NOT_NULL = 'isNotNull',
    IS_EMPTY = 'isEmpty',
    IS_NOT_EMPTY = 'isNotEmpty'
}

// ============================================================================
// Graph Execution Types
// ============================================================================

/**
 * Graph execution state
 */
export interface GraphExecution {
    /** Unique execution ID */
    id: string;
    /** Graph ID */
    graphId: string;
    /** Graph version */
    graphVersion: string;
    /** Current status */
    status: ExecutionStatus;
    /** Input data */
    input: unknown;
    /** Output data */
    output?: unknown;
    /** Node executions */
    nodeExecutions: Map<string, NodeExecution>;
    /** Current active node */
    activeNode?: string;
    /** Error if failed */
    error?: Error;
    /** Execution metadata */
    metadata: GraphExecutionMetadata;
}

/**
 * Execution status enum
 */
export enum ExecutionStatus {
    PENDING = 'pending',
    RUNNING = 'running',
    PAUSED = 'paused',
    COMPLETED = 'completed',
    FAILED = 'failed',
    CANCELLED = 'cancelled',
    WAITING_FOR_INPUT = 'waiting_for_input'
}

/**
 * Node execution state
 */
export interface NodeExecution {
    /** Node ID */
    nodeId: string;
    /** Node type */
    nodeType: NodeType;
    /** Status */
    status: AgentStatus;
    /** Input data */
    input: unknown;
    /** Output data */
    output?: unknown;
    /** Error if failed */
    error?: Error;
    /** Start time */
    startedAt?: Date;
    /** End time */
    completedAt?: Date;
    /** Duration in ms */
    duration?: number;
    /** Retry count */
    retries: number;
    /** Execution order */
    order: number;
}

/**
 * Graph execution metadata
 */
export interface GraphExecutionMetadata {
    /** Start timestamp */
    startedAt?: Date;
    /** End timestamp */
    completedAt?: Date;
    /** Duration in ms */
    duration?: number;
    /** Total cost */
    cost?: number;
    /** Total tokens */
    tokens?: number;
    /** Nodes executed */
    nodesExecuted: number;
    /** Nodes failed */
    nodesFailed: number;
}

// ============================================================================
// Graph Definition Types
// ============================================================================

/**
 * Complete graph definition
 */
export interface GraphDefinition {
    /** Graph ID */
    id: string;
    /** Graph name */
    name: string;
    /** Graph description */
    description: string;
    /** Graph version */
    version: string;
    /** Nodes in the graph */
    nodes: GraphNodeConfig[];
    /** Edges in the graph */
    edges: GraphEdge[];
    /** Graph metadata */
    metadata?: GraphMetadata;
    /** Schema validation */
    inputSchema?: object;
    outputSchema?: object;
}

/**
 * Graph metadata
 */
export interface GraphMetadata {
    /** Author */
    author?: string;
    /** Created date */
    createdAt?: Date;
    /** Updated date */
    updatedAt?: Date;
    /** Tags */
    tags?: string[];
    /** Category */
    category?: string;
    /** Estimated execution time */
    estimatedDuration?: number;
    /** Complexity score */
    complexity?: number;
}

/**
 * Graph validation result
 */
export interface GraphValidation {
    /** Whether graph is valid */
    valid: boolean;
    /** Validation errors */
    errors: GraphValidationError[];
    /** Validation warnings */
    warnings: GraphValidationWarning[];
}

/**
 * Graph validation error
 */
export interface GraphValidationError {
    /** Error code */
    code: string;
    /** Error message */
    message: string;
    /** Affected node/edge */
    location?: string;
    /** Suggestion for fix */
    suggestion?: string;
}

/**
 * Graph validation warning
 */
export interface GraphValidationWarning {
    /** Warning code */
    code: string;
    /** Warning message */
    message: string;
    /** Affected node/edge */
    location?: string;
}

// ============================================================================
// Router & Conditional Types
// ============================================================================

/**
 * Router configuration
 */
export interface RouterConfig {
    /** Router type */
    type: RouterType;
    /** Routes */
    routes: Route[];
    /** Default route */
    defaultRoute?: string;
}

/**
 * Router type enum
 */
export enum RouterType {
    /** Simple condition-based routing */
    CONDITIONAL = 'conditional',
    /** LLM-based routing */
    LLM = 'llm',
    /** Hash-based routing (consistent hashing) */
    HASH = 'hash',
    /** Round-robin routing */
    ROUND_ROBIN = 'round_robin'
}

/**
 * Route definition
 */
export interface Route {
    /** Route ID */
    id: string;
    /** Route name */
    name: string;
    /** Condition for this route */
    condition?: EdgeCondition;
    /** Target node ID */
    targetNode: string;
    /** Weight for weighted routing */
    weight?: number;
}

// ============================================================================
// Parallel Execution Types
// ============================================================================

/**
 * Parallel execution configuration
 */
export interface ParallelConfig {
    /** Execution strategy */
    strategy: ParallelStrategy;
    /** Maximum concurrent executions */
    maxConcurrency?: number;
    /** Whether to stop on first failure */
    stopOnFirstFailure?: boolean;
    /** Aggregation function */
    aggregation?: AggregationConfig;
}

/**
 * Parallel execution strategy
 */
export enum ParallelStrategy {
    /** Execute all simultaneously */
    PARALLEL = 'parallel',
    /** Execute sequentially */
    SEQUENTIAL = 'sequential',
    /** Execute in batches */
    BATCH = 'batch',
    /** Pipeline - output of one feeds into next */
    PIPELINE = 'pipeline'
}

/**
 * Aggregation configuration
 */
export interface AggregationConfig {
    /** Aggregation type */
    type: AggregationType;
    /** Custom aggregation function */
    function?: string;
    /** Field to aggregate */
    field?: string;
}

/**
 * Aggregation types
 */
export enum AggregationType {
    /** Combine all results into array */
    COLLECT = 'collect',
    /** Sum numeric values */
    SUM = 'sum',
    /** Average numeric values */
    AVG = 'avg',
    /** Find minimum */
    MIN = 'min',
    /** Find maximum */
    MAX = 'max',
    /** Custom merge function */
    MERGE = 'merge'
}

// ============================================================================
// Graph Builder Types
// ============================================================================

/**
 * Graph builder interface
 */
export interface GraphBuilder {
    /** Add a node */
    addNode(config: GraphNodeConfig): GraphBuilder;
    /** Add an edge */
    addEdge(edge: GraphEdge): GraphBuilder;
    /** Add conditional edge */
    addConditionalEdge(source: string, target: string, condition: EdgeCondition): GraphBuilder;
    /** Add success edge */
    addSuccessEdge(source: string, target: string): GraphBuilder;
    /** Add failure edge */
    addFailureEdge(source: string, target: string): GraphBuilder;
    /** Set start node */
    setStartNode(nodeId: string): GraphBuilder;
    /** Set end nodes */
    setEndNodes(nodeIds: string[]): GraphBuilder;
    /** Validate the graph */
    validate(): GraphValidation;
    /** Build the graph */
    build(): GraphDefinition;
}

/**
 * Graph executor interface
 */
export interface GraphExecutor {
    /** Execute the graph */
    execute(input: unknown, context?: Partial<AgentContext>): Promise<GraphExecution>;
    /** Resume execution (for paused states) */
    resume(executionId: string, input: unknown): Promise<GraphExecution>;
    /** Cancel execution */
    cancel(executionId: string): Promise<void>;
    /** Get execution status */
    getExecution(executionId: string): GraphExecution | undefined;
    /** Subscribe to execution events */
    on(event: GraphExecutionEvent, handler: ExecutionEventHandler): void;
    /** Unsubscribe from events */
    off(event: GraphExecutionEvent, handler: ExecutionEventHandler): void;
}

/**
 * Graph execution events
 */
export enum GraphExecutionEvent {
    NODE_STARTED = 'graph:node:started',
    NODE_COMPLETED = 'graph:node:completed',
    NODE_FAILED = 'graph:node:failed',
    EDGE_traversed = 'graph:edge:traversed',
    EXECUTION_STARTED = 'graph:execution:started',
    EXECUTION_COMPLETED = 'graph:execution:completed',
    EXECUTION_FAILED = 'graph:execution:failed'
}

/**
 * Execution event handler
 */
export type ExecutionEventHandler = (event: GraphExecutionEvent) => void | Promise<void>;

// ============================================================================
// Human-in-the-Loop Types
// ============================================================================

/**
 * Human review request
 */
export interface HumanReviewRequest {
    /** Request ID */
    id: string;
    /** Execution ID */
    executionId: string;
    /** Node ID */
    nodeId: string;
    /** Review type */
    type: HumanReviewType;
    /** Content to review */
    content: unknown;
    /** Questions for human */
    questions: string[];
    /** Options for selection (if applicable) */
    options?: { id: string; label: string; value: unknown }[];
    /** Deadline for response */
    deadline?: Date;
    /** Assigned reviewer */
    assignee?: string;
}

/**
 * Human review type
 */
export enum HumanReviewType {
    APPROVAL = 'approval',
    SELECTION = 'selection',
    CORRECTION = 'correction',
    INPUT = 'input'
}

/**
 * Human review response
 */
export interface HumanReviewResponse {
    /** Request ID */
    requestId: string;
    /** Reviewer ID */
    reviewerId: string;
    /** Response */
    response: unknown;
    /** Comments */
    comments?: string;
    /** Timestamp */
    timestamp: Date;
}
