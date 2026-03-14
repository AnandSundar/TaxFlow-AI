/**
 * Agent execution types for the frontend
 */

export type AgentStatus = 'idle' | 'running' | 'completed' | 'failed' | 'paused';

export type AgentStepStatus = 'pending' | 'running' | 'completed' | 'failed' | 'skipped';

export type ToolCallStatus = 'pending' | 'executing' | 'completed' | 'failed';

export interface AgentStep {
    id: string;
    name: string;
    description: string;
    status: AgentStepStatus;
    startedAt?: string;
    completedAt?: string;
    duration?: number;
    output?: string;
    toolCalls: ToolCall[];
    reasoning?: string;
    error?: string;
}

export interface ToolCall {
    id: string;
    toolName: string;
    arguments: Record<string, unknown>;
    result?: unknown;
    status: ToolCallStatus;
    startedAt?: string;
    completedAt?: string;
    duration?: number;
    error?: string;
}

export interface AgentExecution {
    id: string;
    agentType: string;
    status: AgentStatus;
    createdAt: string;
    startedAt?: string;
    completedAt?: string;
    duration?: number;
    steps: AgentStep[];
    finalOutput?: string;
    error?: string;
    metadata: Record<string, unknown>;
    clientId?: number;
    documentIds?: number[];
}

export interface AgentMessage {
    id: string;
    role: 'user' | 'assistant' | 'system' | 'tool';
    content: string;
    timestamp: string;
    attachments?: MessageAttachment[];
    toolCalls?: ToolCall[];
    thinking?: string;
}

export interface MessageAttachment {
    id: string;
    name: string;
    type: string;
    url?: string;
    size?: number;
}

export interface ChatSession {
    id: string;
    title: string;
    messages: AgentMessage[];
    createdAt: string;
    updatedAt: string;
    agentType?: string;
}

export interface AIInsight {
    id: string;
    type: 'deduction' | 'compliance' | 'optimization' | 'warning' | 'info';
    title: string;
    description: string;
    confidence: number;
    category: string;
    impact?: string;
    references?: string[];
    createdAt: string;
}

export interface ComplianceFlag {
    id: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    title: string;
    description: string;
    regulation?: string;
    suggestion?: string;
    resolved: boolean;
    resolvedAt?: string;
}

export interface DeductionFound {
    id: string;
    name: string;
    category: string;
    amount?: number;
    description: string;
    confidence: number;
    qualifyingCriteria?: string[];
    documentation?: string[];
}

export interface AgentStats {
    totalExecutions: number;
    successfulExecutions: number;
    failedExecutions: number;
    averageDuration: number;
    executionsToday: number;
}
