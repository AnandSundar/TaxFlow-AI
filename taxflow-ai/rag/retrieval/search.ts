/**
 * TaxFlow AI - Vector Search
 * 
 * Vector search implementation for RAG retrieval.
 * Provides semantic search over embedded document chunks.
 */

import { SearchResult, SearchQuery, RetrievalResult, EmbeddedChunk, VectorStore } from '../types';

/**
 * In-memory vector store implementation
 */
export class InMemoryVectorStore implements VectorStore {
    private chunks: EmbeddedChunk[] = [];

    async add(chunks: EmbeddedChunk[]): Promise<void> {
        this.chunks.push(...chunks);
    }

    async search(query: number[], topK: number): Promise<SearchResult[]> {
        const results = this.chunks.map(chunk => ({
            chunk,
            score: this.cosineSimilarity(query, chunk.embedding)
        }));

        results.sort((a, b) => b.score - a.score);
        return results.slice(0, topK).map(r => ({
            ...r,
            highlights: [r.chunk.content]
        }));
    }

    async delete(documentId: string): Promise<void> {
        this.chunks = this.chunks.filter(c => c.metadata.documentId !== documentId);
    }

    async deleteMany(documentIds: string[]): Promise<void> {
        const ids = new Set(documentIds);
        this.chunks = this.chunks.filter(c => !ids.has(c.metadata.documentId));
    }

    /**
     * Calculate cosine similarity between two vectors
     */
    private cosineSimilarity(a: number[], b: number[]): number {
        if (a.length !== b.length) return 0;

        let dotProduct = 0;
        let normA = 0;
        let normB = 0;

        for (let i = 0; i < a.length; i++) {
            dotProduct += a[i] * b[i];
            normA += a[i] * a[i];
            normB += b[i] * b[i];
        }

        if (normA === 0 || normB === 0) return 0;
        return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    }

    /**
     * Get all chunks
     */
    getAll(): EmbeddedChunk[] {
        return [...this.chunks];
    }

    /**
     * Get chunks by document ID
     */
    getByDocumentId(documentId: string): EmbeddedChunk[] {
        return this.chunks.filter(c => c.metadata.documentId === documentId);
    }

    /**
     * Clear all chunks
     */
    clear(): void {
        this.chunks = [];
    }

    /**
     * Get total chunk count
     */
    size(): number {
        return this.chunks.length;
    }
}

/**
 * Search service
 */
export class SearchService {
    private vectorStore: VectorStore;

    constructor(vectorStore: VectorStore) {
        this.vectorStore = vectorStore;
    }

    /**
     * Search for relevant chunks
     */
    async search(
        query: string,
        embedQuery: (text: string) => Promise<number[]>,
        options: {
            topK?: number;
            minScore?: number;
            filters?: SearchQuery['filters'];
        } = {}
    ): Promise<RetrievalResult> {
        const startTime = Date.now();
        const topK = options.topK || 5;
        const minScore = options.minScore || 0.5;

        // Get query embedding
        const queryEmbedding = await embedQuery(query);

        // Search vector store
        const results = await this.vectorStore.search(queryEmbedding, topK * 2);

        // Apply filters if provided
        let filteredResults = results;
        if (options.filters) {
            filteredResults = this.applyFilters(results, options.filters);
        }

        // Apply minimum score filter
        filteredResults = filteredResults.filter(r => r.score >= minScore);

        // Limit to topK
        filteredResults = filteredResults.slice(0, topK);

        return {
            chunks: filteredResults,
            totalResults: filteredResults.length,
            queryTime: Date.now() - startTime
        };
    }

    /**
     * Apply filters to search results
     */
    private applyFilters(results: SearchResult[], filters: SearchQuery['filters']): SearchResult[] {
        let filtered = results;

        if (filters?.documentIds && filters.documentIds.length > 0) {
            const ids = new Set(filters.documentIds);
            filtered = filtered.filter(r =>
                ids.has(r.chunk.metadata.documentId)
            );
        }

        if (filters?.documentTypes && filters.documentTypes.length > 0) {
            // Would need to fetch document metadata - simplified here
        }

        if (filters?.sources && filters.sources.length > 0) {
            const sources = new Set(filters.sources);
            filtered = filtered.filter(r =>
                sources.has(r.chunk.metadata.source)
            );
        }

        return filtered;
    }

    /**
     * Create highlights from matching text
     */
    createHighlights(content: string, query: string, maxHighlights: number = 3): string[] {
        const queryTerms = query.toLowerCase().split(/\s+/);
        const sentences = content.split(/[.!?]+/);
        const highlights: string[] = [];

        for (const sentence of sentences) {
            const lowerSentence = sentence.toLowerCase();
            for (const term of queryTerms) {
                if (lowerSentence.includes(term)) {
                    const trimmed = sentence.trim();
                    if (trimmed && !highlights.includes(trimmed)) {
                        highlights.push(trimmed);
                        break;
                    }
                }
            }
            if (highlights.length >= maxHighlights) break;
        }

        return highlights;
    }
}

/**
 * Create search service
 */
export function createSearchService(vectorStore?: VectorStore): SearchService {
    const store = vectorStore || new InMemoryVectorStore();
    return new SearchService(store);
}
