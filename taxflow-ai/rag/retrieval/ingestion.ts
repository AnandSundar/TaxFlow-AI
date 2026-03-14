/**
 * TaxFlow AI - Document Ingestion
 * 
 * Handles document loading, chunking, and ingestion into vector store.
 */

import {
    Document,
    TextChunk,
    EmbeddedChunk,
    IngestionResult,
    IngestionError,
    ChunkMetadata
} from '../types';
import { EmbeddingModel } from '../types';
import { VectorStore } from '../types';

/**
 * Document text splitter
 */
export class TextSplitter {
    private chunkSize: number;
    private chunkOverlap: number;

    constructor(chunkSize: number = 1000, chunkOverlap: number = 200) {
        this.chunkSize = chunkSize;
        this.chunkOverlap = chunkOverlap;
    }

    /**
     * Split text into chunks
     */
    splitText(text: string): string[] {
        const chunks: string[] = [];
        let start = 0;

        while (start < text.length) {
            const end = Math.min(start + this.chunkSize, text.length);
            let chunk = text.slice(start, end);

            // Try to break at sentence boundary
            if (end < text.length) {
                const lastPeriod = chunk.lastIndexOf('.');
                const lastNewline = chunk.lastIndexOf('\n');
                const breakPoint = Math.max(lastPeriod, lastNewline);

                if (breakPoint > start) {
                    chunk = text.slice(start, breakPoint + 1);
                }
            }

            chunks.push(chunk.trim());
            start += chunk.length - this.chunkOverlap;
        }

        return chunks;
    }

    /**
     * Split document into chunks with metadata
     */
    splitDocument(document: Document): TextChunk[] {
        const textChunks = this.splitText(document.content);

        return textChunks.map((content, index) => {
            const startChar = document.content.indexOf(content);
            return {
                id: `${document.id}-chunk-${index}`,
                content,
                metadata: {
                    documentId: document.id,
                    documentTitle: document.title,
                    source: document.source,
                    chunkIndex: index,
                    totalChunks: textChunks.length,
                    startChar,
                    endChar: startChar + content.length
                }
            };
        });
    }
}

/**
 * Document ingestion service
 */
export class IngestionService {
    private splitter: TextSplitter;
    private embeddingModel: EmbeddingModel;
    private vectorStore: VectorStore;

    constructor(
        embeddingModel: EmbeddingModel,
        vectorStore: VectorStore,
        chunkSize: number = 1000,
        chunkOverlap: number = 200
    ) {
        this.splitter = new TextSplitter(chunkSize, chunkOverlap);
        this.embeddingModel = embeddingModel;
        this.vectorStore = vectorStore;
    }

    /**
     * Ingest a document
     */
    async ingestDocument(document: Document): Promise<IngestionResult> {
        const errors: IngestionError[] = [];

        try {
            // Split into chunks
            const chunks = this.splitter.splitDocument(document);

            if (chunks.length === 0) {
                return {
                    documentId: document.id,
                    chunksCreated: 0,
                    errors: [{
                        stage: 'splitting',
                        message: 'No content to split',
                        recoverable: false
                    }]
                };
            }

            // Generate embeddings
            const texts = chunks.map(c => c.content);
            const embeddingResult = await this.embeddingModel.embed(texts);

            // Create embedded chunks
            const embeddedChunks: EmbeddedChunk[] = chunks.map((chunk, index) => ({
                ...chunk,
                embedding: embeddingResult.embeddings[index]
            }));

            // Store in vector database
            await this.vectorStore.add(embeddedChunks);

            return {
                documentId: document.id,
                chunksCreated: chunks.length,
                errors
            };

        } catch (error) {
            return {
                documentId: document.id,
                chunksCreated: 0,
                errors: [{
                    stage: 'storing',
                    message: error instanceof Error ? error.message : 'Unknown error',
                    recoverable: true
                }]
            };
        }
    }

    /**
     * Ingest multiple documents
     */
    async ingestDocuments(documents: Document[]): Promise<IngestionResult[]> {
        const results: IngestionResult[] = [];

        for (const doc of documents) {
            const result = await this.ingestDocument(doc);
            results.push(result);
        }

        return results;
    }

    /**
     * Remove document from vector store
     */
    async removeDocument(documentId: string): Promise<void> {
        await this.vectorStore.delete(documentId);
    }
}

/**
 * Create ingestion service
 */
export function createIngestionService(
    embeddingModel: EmbeddingModel,
    vectorStore: VectorStore
): IngestionService {
    return new IngestionService(embeddingModel, vectorStore);
}
