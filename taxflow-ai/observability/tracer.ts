/**
 * TaxFlow AI - Execution Tracer
 * 
 * Provides tracing capabilities for agent execution.
 * Enables debugging, performance monitoring, and audit trails.
 */

import {
    Trace,
    Span,
    SpanStatus,
    SpanKind,
    TraceConfig
} from './types';

/**
 * In-memory span storage
 */
class SpanStorage {
    private spans: Map<string, Span[]> = new Map();
    private traces: Map<string, Trace> = new Map();

    addSpan(traceId: string, span: Span): void {
        if (!this.spans.has(traceId)) {
            this.spans.set(traceId, []);
        }
        this.spans.get(traceId)!.push(span);
    }

    getTrace(traceId: string): Trace | undefined {
        return this.traces.get(traceId);
    }

    getSpans(traceId: string): Span[] {
        return this.spans.get(traceId) || [];
    }

    saveTrace(trace: Trace): void {
        this.traces.set(trace.id, trace);
    }

    clear(): void {
        this.spans.clear();
        this.traces.clear();
    }
}

/**
 * Execution tracer
 */
export class Tracer {
    private storage: SpanStorage;
    private config: TraceConfig;

    constructor(config: TraceConfig = {}) {
        this.storage = new SpanStorage();
        this.config = {
            enabled: true,
            sampleRate: 1.0,
            ...config
        };
    }

    /**
     * Start a new trace
     */
    startTrace(name: string, traceId?: string): Trace {
        const id = traceId || this.generateId();
        const trace: Trace = {
            id,
            name,
            startTime: new Date(),
            spans: [],
            attributes: {},
            status: SpanStatus.OK
        };

        this.storage.saveTrace(trace);
        return trace;
    }

    /**
     * Start a new span
     */
    startSpan(
        traceId: string,
        name: string,
        kind: SpanKind = SpanKind.INTERNAL,
        parentSpanId?: string
    ): Span {
        const span: Span = {
            id: this.generateId(),
            traceId,
            name,
            kind,
            parentSpanId,
            startTime: new Date(),
            attributes: {},
            status: { code: SpanStatus.OK }
        };

        this.storage.addSpan(traceId, span);
        return span;
    }

    /**
     * End a span
     */
    endSpan(span: Span, status?: SpanStatus, error?: Error): void {
        span.endTime = new Date();
        span.duration = span.endTime.getTime() - span.startTime.getTime();

        if (error) {
            span.status = { code: SpanStatus.ERROR, message: error.message };
            span.events = [{
                name: 'exception',
                timestamp: new Date(),
                attributes: {
                    'exception.type': error.name,
                    'exception.message': error.message,
                    'exception.stack': error.stack
                }
            }];
        } else if (status) {
            span.status = { code: status };
        }
    }

    /**
     * End a trace
     */
    endTrace(trace: Trace, status?: SpanStatus): void {
        trace.endTime = new Date();
        trace.duration = trace.endTime.getTime() - trace.startTime.getTime();

        if (status) {
            trace.status = status;
        }
    }

    /**
     * Get a trace
     */
    getTrace(traceId: string): Trace | undefined {
        const trace = this.storage.getTrace(traceId);
        if (trace) {
            trace.spans = this.storage.getSpans(traceId);
        }
        return trace;
    }

    /**
     * Add attribute to span
     */
    setAttribute(span: Span, key: string, value: unknown): void {
        span.attributes[key] = value;
    }

    /**
     * Add attributes to span
     */
    setAttributes(span: Span, attributes: Record<string, unknown>): void {
        span.attributes = { ...span.attributes, ...attributes };
    }

    /**
     * Add event to span
     */
    addEvent(span: Span, name: string, attributes?: Record<string, unknown>): void {
        span.events = span.events || [];
        span.events.push({
            name,
            timestamp: new Date(),
            attributes: attributes || {}
        });
    }

    /**
     * Create a scoped tracer
     */
    startScopedSpan(
        traceId: string,
        name: string,
        kind?: SpanKind
    ): ScopedSpan {
        const span = this.startSpan(traceId, name, kind);
        return new ScopedSpan(this, span);
    }

    /**
     * Generate unique ID
     */
    private generateId(): string {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
}

/**
 * Scoped span for try-finally patterns
 */
export class ScopedSpan {
    private tracer: Tracer;
    private span: Span;
    private ended = false;

    constructor(tracer: Tracer, span: Span) {
        this.tracer = tracer;
        this.span = span;
    }

    setAttribute(key: string, value: unknown): void {
        this.tracer.setAttribute(this.span, key, value);
    }

    setAttributes(attributes: Record<string, unknown>): void {
        this.tracer.setAttributes(this.span, attributes);
    }

    addEvent(name: string, attributes?: Record<string, unknown>): void {
        this.tracer.addEvent(this.span, name, attributes);
    }

    end(status?: SpanStatus, error?: Error): void {
        if (!this.ended) {
            this.tracer.endSpan(this.span, status, error);
            this.ended = true;
        }
    }
}

/**
 * Create tracer instance
 */
export function createTracer(config?: TraceConfig): Tracer {
    return new Tracer(config);
}
