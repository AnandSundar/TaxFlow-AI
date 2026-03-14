/**
 * TaxFlow AI - Memory Types
 * 
 * Type definitions for agent memory systems.
 * Defines the interfaces for working, episodic, and semantic memory.
 */

// ============================================================================
// Memory Entry Types
// ============================================================================

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
    metadata?: Record<string, unknown>;
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
    category?: string;
    tags?: string[];
}

// ============================================================================
// Memory Interface Types
// ============================================================================

/**
 * Working memory - short-term data during execution
 */
export interface WorkingMemory {
    get<T>(key: string): T | undefined;
    set<T>(key: string, value: T): void;
    delete(key: string): void;
    has(key: string): boolean;
    clear(): void;
    keys(): string[];
    entries(): [string, unknown][];
}

/**
 * Episodic memory - historical execution data
 */
export interface EpisodicMemory {
    add(entry: MemoryEntry): void;
    query(query: MemoryQuery): Promise<MemoryEntry[]>;
    recent(limit: number): Promise<MemoryEntry[]>;
    clear(): void;
    size(): number;
}

/**
 * Semantic memory - long-term knowledge
 */
export interface SemanticMemory {
    store(fact: Fact): void;
    query(query: string): Promise<Fact[]>;
    get(id: string): Fact | undefined;
    getAll(): Fact[];
    clear(): void;
}

// ============================================================================
// Working Memory Types
// ============================================================================

/**
 * Working memory entry
 */
export interface WorkingMemoryEntry {
    key: string;
    value: unknown;
    createdAt: Date;
    updatedAt: Date;
}

/**
 * Working memory options
 */
export interface WorkingMemoryOptions {
    maxSize?: number;
    ttl?: number;
    persistKeys?: string[];
}

// ============================================================================
// Episodic Memory Types
// ============================================================================

/**
 * Episodic memory configuration
 */
export interface EpisodicMemoryConfig {
    maxEntries: number;
    importanceThreshold: number;
    retentionDays: number;
}

/**
 * Episodic memory query result
 */
export interface EpisodicQueryResult {
    entries: MemoryEntry[];
    total: number;
    relevance: number;
}

// ============================================================================
// Semantic Memory Types
// ============================================================================

/**
 * Semantic memory configuration
 */
export interface SemanticMemoryConfig {
    maxFacts: number;
    similarityThreshold: number;
    indexingEnabled: boolean;
}

/**
 * Semantic memory search options
 */
export interface SemanticSearchOptions {
    limit?: number;
    minConfidence?: number;
    category?: string;
    tags?: string[];
}

// ============================================================================
// Memory Events
// ============================================================================

/**
 * Memory event types
 */
export enum MemoryEventType {
    WORKING_SET = 'memory:working:set',
    WORKING_DELETE = 'memory:working:delete',
    EPISODIC_ADD = 'memory:episodic:add',
    SEMANTIC_STORE = 'memory:semantic:store'
}

/**
 * Memory event
 */
export interface MemoryEvent {
    type: MemoryEventType;
    timestamp: Date;
    data: unknown;
}

// ============================================================================
// Memory Manager Types
// ============================================================================

/**
 * Memory manager interface
 */
export interface MemoryManager {
    working: WorkingMemory;
    episodic: EpisodicMemory;
    semantic: SemanticMemory;
    clear(): void;
    export(): MemoryExport;
    import(data: MemoryExport): void;
}

/**
 * Memory export/import format
 */
export interface MemoryExport {
    version: string;
    exportedAt: Date;
    working: [string, unknown][];
    episodic: MemoryEntry[];
    semantic: Fact[];
}
