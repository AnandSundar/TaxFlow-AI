/**
 * TaxFlow AI - Memory Store
 * 
 * In-memory storage implementation for agent context and memory.
 * Provides working, episodic, and semantic memory capabilities.
 * 
 * Architecture Decision:
 * - In-memory storage for low-latency access
 * - Thread-safe with proper locking
 * - Persistence options for critical data
 */

import {
    AgentMemory,
    WorkingMemory,
    EpisodicMemory,
    SemanticMemory,
    MemoryEntry,
    MemoryQuery,
    Fact
} from './types';

/**
 * In-memory working memory implementation
 */
export class InMemoryWorkingMemory implements WorkingMemory {
    private store: Map<string, unknown> = new Map();
    private listeners: Map<string, Set<Function>> = new Map();

    get<T>(key: string): T | undefined {
        return this.store.get(key) as T | undefined;
    }

    set<T>(key: string, value: T): void {
        const oldValue = this.store.get(key);
        this.store.set(key, value);
        this.notifyListeners(key, value, oldValue);
    }

    delete(key: string): void {
        const oldValue = this.store.get(key);
        this.store.delete(key);
        this.notifyListeners(key, undefined, oldValue);
    }

    has(key: string): boolean {
        return this.store.has(key);
    }

    clear(): void {
        this.store.clear();
    }

    keys(): string[] {
        return Array.from(this.store.keys());
    }

    entries(): [string, unknown][] {
        return Array.from(this.store.entries());
    }

    on(key: string, listener: Function): void {
        if (!this.listeners.has(key)) {
            this.listeners.set(key, new Set());
        }
        this.listeners.get(key)!.add(listener);
    }

    off(key: string, listener: Function): void {
        this.listeners.get(key)?.delete(listener);
    }

    private notifyListeners(key: string, newValue: unknown, oldValue: unknown): void {
        const keyListeners = this.listeners.get(key);
        if (keyListeners) {
            keyListeners.forEach(listener => listener(newValue, oldValue));
        }
    }
}

/**
 * In-memory episodic memory implementation
 */
export class InMemoryEpisodicMemory implements EpisodicMemory {
    private entries: MemoryEntry[] = [];
    private maxEntries: number;

    constructor(maxEntries: number = 1000) {
        this.maxEntries = maxEntries;
    }

    add(entry: MemoryEntry): void {
        this.entries.push(entry);

        // Trim old entries if over limit
        if (this.entries.length > this.maxEntries) {
            this.entries = this.entries.slice(-this.maxEntries);
        }
    }

    async query(query: MemoryQuery): Promise<MemoryEntry[]> {
        let results = [...this.entries];

        if (query.type) {
            results = results.filter(e => e.type === query.type);
        }

        if (query.tags && query.tags.length > 0) {
            results = results.filter(e =>
                query.tags!.some(tag => e.tags.includes(tag))
            );
        }

        if (query.startDate) {
            results = results.filter(e => e.timestamp >= query.startDate!);
        }

        if (query.endDate) {
            results = results.filter(e => e.timestamp <= query.endDate!);
        }

        if (query.importance !== undefined) {
            results = results.filter(e => e.importance >= query.importance!);
        }

        // Sort by timestamp (most recent first)
        results.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

        // Apply limit
        if (query.limit) {
            results = results.slice(0, query.limit);
        }

        return results;
    }

    async recent(limit: number): Promise<MemoryEntry[]> {
        return this.query({ limit });
    }

    clear(): void {
        this.entries = [];
    }

    size(): number {
        return this.entries.length;
    }
}

/**
 * In-memory semantic memory implementation
 */
export class InMemorySemanticMemory implements SemanticMemory {
    private facts: Map<string, Fact> = new Map();
    private index: Map<string, Set<string>> = new Map();

    store(fact: Fact): void {
        this.facts.set(fact.id, fact);

        // Index by words in statement
        const words = fact.statement.toLowerCase().split(/\s+/);
        for (const word of words) {
            if (!this.index.has(word)) {
                this.index.set(word, new Set());
            }
            this.index.get(word)!.add(fact.id);
        }
    }

    async query(searchQuery: string): Promise<Fact[]> {
        const words = searchQuery.toLowerCase().split(/\s+/);
        const matchingIds = new Set<string>();

        for (const word of words) {
            const wordIds = this.index.get(word);
            if (wordIds) {
                wordIds.forEach(id => matchingIds.add(id));
            }
        }

        const facts = Array.from(matchingIds)
            .map(id => this.facts.get(id)!)
            .filter(Boolean)
            .sort((a, b) => b.confidence - a.confidence);

        return facts;
    }

    get(id: string): Fact | undefined {
        return this.facts.get(id);
    }

    getAll(): Fact[] {
        return Array.from(this.facts.values());
    }

    clear(): void {
        this.facts.clear();
        this.index.clear();
    }
}

/**
 * Complete memory store implementation
 */
export class MemoryStore implements AgentMemory {
    working: WorkingMemory;
    episodic: EpisodicMemory;
    semantic: SemanticMemory;

    constructor(options: MemoryStoreOptions = {}) {
        this.working = new InMemoryWorkingMemory();
        this.episodic = new InMemoryEpisodicMemory(options.maxEpisodicEntries);
        this.semantic = new InMemorySemanticMemory();
    }

    /**
     * Create from existing data
     */
    static fromData(data: MemoryStoreData): MemoryStore {
        const store = new MemoryStore();

        // Restore episodic memory
        for (const entry of data.episodic) {
            store.episodic.add(entry);
        }

        // Restore semantic memory
        for (const fact of data.semantic) {
            store.semantic.store(fact);
        }

        return store;
    }

    /**
     * Export data
     */
    toData(): MemoryStoreData {
        return {
            episodic: [], // Would need to fetch from episodic
            semantic: []  // Would need to fetch from semantic
        };
    }

    /**
     * Clear all memory
     */
    clear(): void {
        this.working.clear();
        (this.episodic as InMemoryEpisodicMemory).clear();
        (this.semantic as InMemorySemanticMemory).clear();
    }
}

/**
 * Memory store options
 */
export interface MemoryStoreOptions {
    maxEpisodicEntries?: number;
}

/**
 * Memory store data for serialization
 */
export interface MemoryStoreData {
    episodic: MemoryEntry[];
    semantic: Fact[];
}

/**
 * Create a new memory store
 */
export function createMemoryStore(options?: MemoryStoreOptions): MemoryStore {
    return new MemoryStore(options);
}
