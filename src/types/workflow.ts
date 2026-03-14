/**
 * Workflow types for the frontend
 */

export type WorkflowStatus = 'draft' | 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';

export type WorkflowNodeType =
    | 'document-intelligence'
    | 'financial-extraction'
    | 'tax-knowledge'
    | 'deduction-discovery'
    | 'compliance-check'
    | 'summary-generator'
    | 'custom';

export interface WorkflowNode {
    id: string;
    type: WorkflowNodeType;
    name: string;
    description: string;
    config: Record<string, unknown>;
    position: { x: number; y: number };
}

export interface WorkflowEdge {
    id: string;
    source: string;
    target: string;
    condition?: string;
}

export interface WorkflowTemplate {
    id: string;
    name: string;
    description: string;
    category: string;
    nodes: WorkflowNode[];
    edges: WorkflowEdge[];
    createdAt: string;
    updatedAt: string;
    isPublic: boolean;
}

export interface WorkflowExecution {
    id: string;
    workflowId: string;
    workflowName: string;
    status: WorkflowStatus;
    progress: number;
    currentNode?: string;
    createdAt: string;
    startedAt?: string;
    completedAt?: string;
    duration?: number;
    nodes: WorkflowNodeExecution[];
    result?: WorkflowResult;
    error?: string;
}

export interface WorkflowNodeExecution {
    nodeId: string;
    nodeName: string;
    nodeType: WorkflowNodeType;
    status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
    startedAt?: string;
    completedAt?: string;
    duration?: number;
    output?: unknown;
    error?: string;
}

export interface WorkflowResult {
    summary: string;
    insights: string[];
    documents: number;
    deductions: number;
    complianceIssues: number;
    processingTime: number;
}

export interface WorkflowRunRequest {
    workflowId: string;
    clientId?: number;
    documentIds?: number[];
    parameters?: Record<string, unknown>;
}

export interface WorkflowStats {
    totalRuns: number;
    successfulRuns: number;
    failedRuns: number;
    averageDuration: number;
    runsToday: number;
}

export interface TimelineEvent {
    id: string;
    type: 'step_start' | 'step_complete' | 'step_fail' | 'tool_call' | 'tool_result' | 'error' | 'info';
    message: string;
    timestamp: string;
    nodeId?: string;
    nodeName?: string;
    data?: Record<string, unknown>;
}
