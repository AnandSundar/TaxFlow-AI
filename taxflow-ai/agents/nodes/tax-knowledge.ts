/**
 * TaxFlow AI - Tax Knowledge RAG Agent
 * 
 * Agent that uses RAG (Retrieval Augmented Generation) to answer
 * tax-related questions based on current tax regulations and knowledge base.
 * 
 * Architecture Decision:
 * - RAG-based agent provides accurate, up-to-date tax information
 * - Separates retrieval from generation for transparency
 * - Cites sources for all information provided
 */

import { BaseAgent } from './base';
import { AgentContext } from '../types';

export interface TaxKnowledgeInput {
    /** User question */
    question: string;
    /** Tax year */
    taxYear?: number;
    /** Filing status */
    filingStatus?: string;
    /** Additional context */
    context?: Record<string, unknown>;
}

export interface TaxKnowledgeOutput {
    /** Answer to the question */
    answer: string;
    /** Sources cited */
    sources: TaxSource[];
    /** Relevant regulations */
    regulations: TaxRegulation[];
    /** Confidence score */
    confidence: number;
    /** Related questions */
    relatedQuestions?: string[];
}

export interface TaxSource {
    /** Source ID */
    id: string;
    /** Source title */
    title: string;
    /** Source type */
    type: SourceType;
    /** URL or location */
    location: string;
    /** Relevance score */
    relevance: number;
    /** Excerpt */
    excerpt: string;
}

export enum SourceType {
    IRS_FORM = 'irs_form',
    IRS_PUBLICATION = 'irs_publication',
    TAX_CODE = 'tax_code',
    COURT_RULING = 'court_ruling',
    REGULATION = 'regulation',
    GUIDANCE = 'guidance',
    FAQ = 'faq'
}

export interface TaxRegulation {
    /** Regulation code */
    code: string;
    /** Regulation title */
    title: string;
    /** Section */
    section: string;
    /** Description */
    description: string;
    /** Effective date */
    effectiveDate?: Date;
    /** URL */
    url?: string;
}

/**
 * Tax Knowledge Agent
 * Answers tax questions using RAG
 */
export class TaxKnowledgeAgent extends BaseAgent<TaxKnowledgeInput, TaxKnowledgeOutput> {
    constructor() {
        super({
            id: 'tax-knowledge',
            name: 'Tax Knowledge Agent',
            description: 'Answers tax questions using tax regulation knowledge base',
            timeout: 30000,
            retry: {
                maxAttempts: 2,
                baseDelay: 1000,
                backoffMultiplier: 2,
                maxDelay: 10000
            }
        });
    }

    protected async run(input: TaxKnowledgeInput, context: AgentContext): Promise<TaxKnowledgeOutput> {
        // Step 1: Retrieve relevant knowledge
        const sources = await this.retrieveKnowledge(input.question);

        // Step 2: Extract relevant regulations
        const regulations = await this.extractRegulations(sources);

        // Step 3: Generate answer (in production, would use LLM)
        const answer = this.generateAnswer(input.question, sources);

        // Step 4: Calculate confidence
        const confidence = this.calculateConfidence(sources, regulations);

        // Step 5: Suggest related questions
        const relatedQuestions = this.suggestRelatedQuestions(input.question);

        return {
            answer,
            sources,
            regulations,
            confidence,
            relatedQuestions
        };
    }

    private async retrieveKnowledge(question: string): Promise<TaxSource[]> {
        // In production, would query vector database
        // Return sample sources
        return [
            {
                id: 'irs-pub-501',
                title: 'IRS Publication 501: Dependents, Standard Deduction, and Filing Information',
                type: SourceType.IRS_PUBLICATION,
                location: 'https://irs.gov/pub501',
                relevance: 0.95,
                excerpt: 'The standard deduction is a dollar amount that reduces your taxable income...'
            },
            {
                id: 'sec-62',
                title: 'IRC Section 62: Adjusted Gross Income',
                type: SourceType.TAX_CODE,
                location: 'IRC Section 62',
                relevance: 0.85,
                excerpt: 'Adjusted gross income is gross income minus certain deductions...'
            }
        ];
    }

    private async extractRegulations(sources: TaxSource[]): Promise<TaxRegulation[]> {
        return [
            {
                code: 'IRC §62',
                title: 'Adjusted Gross Income',
                section: '62',
                description: 'Defines adjusted gross income and above-the-line deductions',
                url: 'https://law.cfr.org/irs-code/section-62'
            }
        ];
    }

    private generateAnswer(question: string, sources: TaxSource[]): string {
        // Simplified answer generation
        return `Based on the current tax regulations, here is the answer to your question about "${question}":\n\n` +
            `The standard deduction reduces your taxable income. For the 2024 tax year, the standard deduction ranges from $14,600 for single filers to $29,200 for married filing jointly.\n\n` +
            `Sources: ${sources.map(s => s.title).join(', ')}`;
    }

    private calculateConfidence(sources: TaxSource[], regulations: TaxRegulation[]): number {
        if (sources.length === 0) return 0;
        const avgRelevance = sources.reduce((sum, s) => sum + s.relevance, 0) / sources.length;
        return Math.min(avgRelevance * 1.1, 1.0);
    }

    private suggestRelatedQuestions(question: string): string[] {
        return [
            'What is the standard deduction for my filing status?',
            'What are above-the-line deductions?',
            'Should I itemize or take the standard deduction?'
        ];
    }

    protected initializeCapabilities() {
        return {
            tools: [],
            models: [],
            maxContextLength: 128000
        };
    }
}

export function createTaxKnowledgeAgent(): TaxKnowledgeAgent {
    return new TaxKnowledgeAgent();
}
