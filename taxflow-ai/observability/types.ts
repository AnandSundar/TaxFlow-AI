/**
 * TaxFlow AI - Trace Types
 * 
 * Type definitions for distributed tracing.
 */

export interface Trace {
    id: string;
    name: string;
    startTime: Date;
    endTime?: Date;
    duration?: number;
    spans: Span[];
    attributes: Record<string, unknown>;
    status: SpanStatus;
}

export interface Span {
    id: string;
    traceId: string;
    parentSpanId?: string;
    name: string;
    kind: SpanKind;
    startTime: Date;
    endTime?: Date;
    duration?: number;
    attributes: Record<string, unknown>;
    status: SpanStatusData;
    events?: SpanEvent[];
}

export enum SpanKind {
    INTERNAL = 'internal',
    SERVER = 'server',
    CLIENT = 'client',
    PRODUCER = 'producer',
    CONSUMER = 'consumer'
}

export enum SpanStatus {
    OK = 'ok',
    ERROR = 'error',
    UNSET = 'unset'
}

export interface SpanStatusData {
    code: SpanStatus;
    message?: string;
}

export interface SpanEvent {
    name: string;
    timestamp: Date;
    attributes?: Record<string, unknown>;
}

export interface TraceConfig {
    enabled: boolean;
    sampleRate: number;
    exporter?: TraceExporter;
}

export interface TraceExporter {
    export(traces: Trace[]): Promise<void>;
}

export interface SpanContext {
    traceId: string;
    spanId: string;
}
