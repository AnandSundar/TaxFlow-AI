/**
 * TaxFlow AI - Embedding Generation
 * 
 * Handles embedding generation for document chunks.
 * Supports multiple embedding providers.
 */

import { EmbeddingModel, EmbeddingResult } from '../types';

/**
 * OpenAI embeddings implementation
 */
export class OpenAIEmbeddingModel implements EmbeddingModel {
    private model: string;
    private dimensions: number;

    constructor(model: string = 'text-embedding-3-small') {
        this.model = model;
        this.dimensions = model.includes('3-small') ? 1536 : 3072;
    }

    async embed(texts: string[]): Promise<EmbeddingResult> {
        // In production, would call OpenAI API
        // Simulated embeddings for demonstration
        const embeddings = texts.map(text => this.generateSimulatedEmbedding(text));

        return {
            embeddings,
            tokens: texts.reduce((sum, t) => sum + Math.ceil(t.length / 4), 0),
            model: this.model
        };
    }

    async embedQuery(text: string): Promise<number[]> {
        const result = await this.embed([text]);
        return result.embeddings[0];
    }

    getDimensions(): number {
        return this.dimensions;
    }

    /**
     * Generate simulated embedding (for demo purposes)
     */
    private generateSimulatedEmbedding(text: string): number[] {
        const seed = this.hashString(text);
        const dimensions = this.dimensions;
        const embedding = new Array(dimensions);

        // Simple hash-based pseudo-random generation
        for (let i = 0; i < dimensions; i++) {
            embedding[i] = Math.sin(seed + i * 0.1) * Math.cos(seed * 0.1 + i);
        }

        // Normalize
        const norm = Math.sqrt(embedding.reduce((sum, v) => sum + v * v, 0));
        return embedding.map(v => v / norm);
    }

    /**
     * Simple string hash
     */
    private hashString(str: string): number {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = ((hash << 5) - hash) + str.charCodeAt(i);
            hash = hash & hash;
        }
        return hash;
    }
}

/**
 * Sentence transformer embeddings (alternative)
 */
export class SentenceTransformerEmbeddingModel implements EmbeddingModel {
    private modelName: string;
    private dimensions: number;

    constructor(modelName: string = 'all-MiniLM-L6-v2') {
        this.modelName = modelName;
        this.dimensions = 384;
    }

    async embed(texts: string[]): Promise<EmbeddingResult> {
        // In production, would use @xenova/transformers
        const embeddings = texts.map(() => this.generateRandomEmbedding());

        return {
            embeddings,
            tokens: texts.reduce((sum, t) => sum + Math.ceil(t.length / 4), 0),
            model: this.modelName
        };
    }

    async embedQuery(text: string): Promise<number[]> {
        const result = await this.embed([text]);
        return result.embeddings[0];
    }

    getDimensions(): number {
        return this.dimensions;
    }

    private generateRandomEmbedding(): number[] {
        const embedding = new Array(this.dimensions);
        for (let i = 0; i < this.dimensions; i++) {
            embedding[i] = Math.random() * 2 - 1;
        }
        // Normalize
        const norm = Math.sqrt(embedding.reduce((sum, v) => sum + v * v, 0));
        return embedding.map(v => v / norm);
    }
}

/**
 * Create embedding model based on configuration
 */
export function createEmbeddingModel(config: EmbeddingConfig): EmbeddingModel {
    switch (config.provider) {
        case 'openai':
            return new OpenAIEmbeddingModel(config.model);
        case 'huggingface':
            return new SentenceTransformerEmbeddingModel(config.model);
        default:
            return new OpenAIEmbeddingModel();
    }
}

export interface EmbeddingConfig {
    provider: 'openai' | 'huggingface';
    model: string;
    apiKey?: string;
}
