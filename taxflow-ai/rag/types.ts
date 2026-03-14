/**
 * TaxFlow AI - RAG Types
 * 
 * Type definitions for the Retrieval Augmented Generation system.
 * Defines document types, embeddings, and retrieval interfaces.
 */

export interface RAGConfig {
    /** Embedding model to use */
    embeddingModel: string;
    /** Vector store type */
    vectorStore: VectorStoreType;
    /** Chunk size for document splitting */
    chunkSize: number;
    /** Chunk overlap */
    chunkOverlap: number;
    /** Number of results to retrieve */
    topK: number;
    /** Minimum similarity score */
    minScore: number;
}

export enum VectorStoreType {
    IN_MEMORY = 'in_memory',
    PINECONE = 'pinecone',
    WEAVIATE = 'weaviate',
    CHROMA = 'chroma',
    QDRANT = 'qdrant'
}

export interface TextChunk {
    id: string;
    content: string;
    metadata: ChunkMetadata;
    embedding?: number[];
}

export interface ChunkMetadata {
    documentId: string;
    documentTitle: string;
    source: string;
    chunkIndex: number;
    totalChunks: number;
    startChar: number;
    endChar: number;
}

export interface EmbeddedChunk extends TextChunk {
    embedding: number[];
}

export interface Document {
    id: string;
    title: string;
    content: string;
    type: DocumentType;
    source: string;
    url?: string;
    createdAt: Date;
    updatedAt: Date;
    metadata: Record<string, unknown>;
}

export enum DocumentType {
    IRS_PUBLICATION = 'irs_publication',
    FORM_INSTRUCTIONS = 'form_instructions',
    TAX_CODE = 'tax_code',
    REGULATION = 'regulation',
    GUIDANCE = 'guidance',
    FAQ = 'faq',
    COURT_RULING = 'court_ruling'
}

export interface SearchResult {
    chunk: TextChunk;
    score: number;
    highlights: string[];
}

export interface SearchQuery {
    query: string;
    filters?: SearchFilters;
    topK?: number;
    minScore?: number;
}

export interface SearchFilters {
    documentIds?: string[];
    documentTypes?: DocumentType[];
    sources?: string[];
    dateRange?: {
        start?: Date;
        end?: Date;
    };
}

export interface RetrievalResult {
    chunks: SearchResult[];
    totalResults: number;
    queryTime: number;
}

export interface EmbeddingResult {
    embeddings: number[][];
    tokens: number;
    model: string;
}

export interface VectorStore {
    add(chunks: EmbeddedChunk[]): Promise<void>;
    search(query: number[], topK: number): Promise<SearchResult[]>;
    delete(documentId: string): Promise<void>;
    deleteMany(documentIds: string[]): Promise<void>;
}

export interface EmbeddingModel {
    embed(texts: string[]): Promise<EmbeddingResult>;
    embedQuery(text: string): Promise<number[]>;
    getDimensions(): number;
}

export interface IngestionResult {
    documentId: string;
    chunksCreated: number;
    errors: IngestionError[];
}

export interface IngestionError {
    stage: 'loading' | 'splitting' | 'embedding' | 'storing';
    message: string;
    recoverable: boolean;
}
