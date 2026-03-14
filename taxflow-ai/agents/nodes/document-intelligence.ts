/**
 * TaxFlow AI - Document Intelligence Agent
 * 
 * Agent responsible for parsing and understanding tax documents (W-2s, 1099s,
 * invoices, receipts, and other financial documents). Coordinates with the
 * document-intelligence module for parsing and OCR.
 * 
 * Architecture Decision:
 * - Specialized agent focuses on document processing pipeline
 * - Outputs structured document data for downstream agents
 * - Supports multiple document types with type-specific parsing
 */

import { BaseAgent } from './base';
import { AgentContext, AgentResult, AgentStatus } from '../types';

export interface DocumentInput {
    /** Document URL or file path */
    documentUrl: string;
    /** Document type if known */
    documentType?: DocumentType;
    /** Processing options */
    options?: DocumentProcessingOptions;
}

export interface DocumentOutput {
    /** Parsed document data */
    document: ParsedDocument;
    /** Extracted entities */
    entities: ExtractedEntity[];
    /** Processing metadata */
    metadata: DocumentProcessingMetadata;
    /** Confidence scores */
    confidence: ConfidenceScores;
}

export enum DocumentType {
    W2 = 'W2',
    FORM_1099 = '1099',
    FORM_1098 = '1098',
    INVOICE = 'INVOICE',
    RECEIPT = 'RECEIPT',
    BANK_STATEMENT = 'BANK_STATEMENT',
    INVESTMENT_STATEMENT = 'INVESTMENT_STATEMENT',
    PROPERTY_TAX = 'PROPERTY_TAX',
    UNKNOWN = 'UNKNOWN'
}

export interface DocumentProcessingOptions {
    /** Enable OCR for scanned documents */
    enableOcr?: boolean;
    /** Extract tables */
    extractTables?: boolean;
    /** Extract images */
    extractImages?: boolean;
    /** Language for OCR */
    language?: string;
    /** Custom field extraction */
    customFields?: string[];
}

export interface ParsedDocument {
    /** Document ID */
    id: string;
    /** Document type */
    type: DocumentType;
    /** Document source */
    source: string;
    /** Page count */
    pageCount: number;
    /** Extracted text */
    text: string;
    /** Structured data */
    data: Record<string, unknown>;
    /** Tables found */
    tables?: TableData[];
    /** Images found */
    images?: ImageData[];
}

export interface TableData {
    /** Table index */
    index: number;
    /** Rows */
    rows: string[][];
    /** Headers */
    headers?: string[];
}

export interface ImageData {
    /** Image index */
    index: number;
    /** Image data URL */
    dataUrl: string;
    /** Bounding box */
    boundingBox?: BoundingBox;
}

export interface BoundingBox {
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface ExtractedEntity {
    /** Entity type */
    type: EntityType;
    /** Entity value */
    value: string;
    /** Normalized value */
    normalizedValue?: string;
    /** Confidence */
    confidence: number;
    /** Bounding box (for visual entities) */
    boundingBox?: BoundingBox;
    /** Page number */
    page: number;
}

export enum EntityType {
    NAME = 'NAME',
    ADDRESS = 'ADDRESS',
    SSN = 'SSN',
    EIN = 'EIN',
    PHONE = 'PHONE',
    EMAIL = 'EMAIL',
    DATE = 'DATE',
    MONEY = 'MONEY',
    PERCENTAGE = 'PERCENTAGE',
    ACCOUNT_NUMBER = 'ACCOUNT_NUMBER',
    TAX_YEAR = 'TAX_YEAR',
    EMPLOYER = 'EMPLOYER',
    EMPLOYEE = 'EMPLOYEE',
    VENDOR = 'VENDOR',
    CUSTOMER = 'CUSTOMER',
    LINE_ITEM = 'LINE_ITEM',
    SIGNATURE = 'SIGNATURE'
}

export interface DocumentProcessingMetadata {
    /** Processing duration in ms */
    processingTime: number;
    /** OCR used */
    ocrUsed: boolean;
    /** Pages processed */
    pagesProcessed: number;
    /** Errors encountered */
    errors?: string[];
}

export interface ConfidenceScores {
    /** Overall document parsing confidence */
    overall: number;
    /** Entity extraction confidence */
    entities: Record<string, number>;
    /** Table extraction confidence */
    tables?: number;
}

/**
 * Document Intelligence Agent
 * Parses and extracts information from tax-related documents
 */
export class DocumentIntelligenceAgent extends BaseAgent<DocumentInput, DocumentOutput> {
    constructor() {
        super({
            id: 'doc-intelligence',
            name: 'Document Intelligence Agent',
            description: 'Parses and extracts information from tax documents including W-2s, 1099s, invoices, and receipts',
            timeout: 120000, // 2 minutes for document processing
            retry: {
                maxAttempts: 2,
                baseDelay: 2000,
                backoffMultiplier: 2,
                maxDelay: 30000
            }
        });
    }

    /**
     * Main execution logic for document intelligence
     */
    protected async run(input: DocumentInput, context: AgentContext): Promise<DocumentOutput> {
        const startTime = Date.now();

        // Step 1: Determine document type if not provided
        let documentType = input.documentType;
        if (!documentType) {
            documentType = await this.detectDocumentType(input.documentUrl, context);
        }

        // Step 2: Parse the document
        const parsedDocument = await this.parseDocument(
            input.documentUrl,
            documentType,
            input.options,
            context
        );

        // Step 3: Extract entities
        const entities = await this.extractEntities(parsedDocument, context);

        // Step 4: Calculate confidence scores
        const confidence = this.calculateConfidence(parsedDocument, entities);

        const processingTime = Date.now() - startTime;

        return {
            document: parsedDocument,
            entities,
            metadata: {
                processingTime,
                ocrUsed: input.options?.enableOcr ?? false,
                pagesProcessed: parsedDocument.pageCount
            },
            confidence
        };
    }

    /**
     * Detect document type from URL or content
     */
    private async detectDocumentType(documentUrl: string, context: AgentContext): Promise<DocumentType> {
        // In production, this would analyze the document
        // For now, use URL patterns as hints
        const url = documentUrl.toLowerCase();

        if (url.includes('w2') || url.includes('w-2')) return DocumentType.W2;
        if (url.includes('1099')) return DocumentType.FORM_1099;
        if (url.includes('1098')) return DocumentType.FORM_1098;
        if (url.includes('invoice')) return DocumentType.INVOICE;
        if (url.includes('receipt')) return DocumentType.RECEIPT;
        if (url.includes('bank')) return DocumentType.BANK_STATEMENT;
        if (url.includes('investment')) return DocumentType.INVESTMENT_STATEMENT;
        if (url.includes('property')) return DocumentType.PROPERTY_TAX;

        return DocumentType.UNKNOWN;
    }

    /**
     * Parse document based on type
     */
    private async parseDocument(
        documentUrl: string,
        documentType: DocumentType,
        options: DocumentProcessingOptions | undefined,
        context: AgentContext
    ): Promise<ParsedDocument> {
        // In production, this would call the document-intelligence module
        // For demonstration, return a structured mock

        return {
            id: this.generateId(),
            type: documentType,
            source: documentUrl,
            pageCount: 1,
            text: 'Sample parsed text from document',
            data: this.getTypeSpecificData(documentType),
            tables: [],
            images: []
        };
    }

    /**
     * Get type-specific data structure
     */
    private getTypeSpecificData(documentType: DocumentType): Record<string, unknown> {
        switch (documentType) {
            case DocumentType.W2:
                return {
                    employer: {},
                    employee: {},
                    wages: {},
                    taxes: {},
                    deductions: {}
                };
            case DocumentType.FORM_1099:
                return {
                    payer: {},
                    recipient: {},
                    income: {},
                    deductions: {}
                };
            case DocumentType.INVOICE:
                return {
                    invoiceNumber: '',
                    date: '',
                    vendor: {},
                    lineItems: [],
                    totals: {}
                };
            default:
                return {};
        }
    }

    /**
     * Extract entities from parsed document
     */
    private async extractEntities(
        document: ParsedDocument,
        context: AgentContext
    ): Promise<ExtractedEntity[]> {
        const entities: ExtractedEntity[] = [];

        // Extract based on document type
        switch (document.type) {
            case DocumentType.W2:
                entities.push(...this.extractW2Entities(document));
                break;
            case DocumentType.FORM_1099:
                entities.push(...this.extract1099Entities(document));
                break;
            case DocumentType.INVOICE:
            case DocumentType.RECEIPT:
                entities.push(...this.extractInvoiceEntities(document));
                break;
        }

        return entities;
    }

    /**
     * Extract W-2 specific entities
     */
    private extractW2Entities(document: ParsedDocument): ExtractedEntity[] {
        const entities: ExtractedEntity[] = [];

        // Add common entities
        entities.push({
            type: EntityType.TAX_YEAR,
            value: '2024',
            confidence: 0.99,
            page: 1
        });

        return entities;
    }

    /**
     * Extract 1099 specific entities
     */
    private extract1099Entities(document: ParsedDocument): ExtractedEntity[] {
        return [
            {
                type: EntityType.TAX_YEAR,
                value: '2024',
                confidence: 0.99,
                page: 1
            }
        ];
    }

    /**
     * Extract invoice/receipt entities
     */
    private extractInvoiceEntities(document: ParsedDocument): ExtractedEntity[] {
        return [
            {
                type: EntityType.DATE,
                value: new Date().toISOString(),
                confidence: 0.95,
                page: 1
            },
            {
                type: EntityType.MONEY,
                value: '0.00',
                normalizedValue: '0.00',
                confidence: 0.90,
                page: 1
            }
        ];
    }

    /**
     * Calculate confidence scores
     */
    private calculateConfidence(
        document: ParsedDocument,
        entities: ExtractedEntity[]
    ): ConfidenceScores {
        const entityConfidences: Record<string, number> = {};

        for (const entity of entities) {
            entityConfidences[entity.type] = entity.confidence;
        }

        const avgEntityConfidence = entities.length > 0
            ? entities.reduce((sum, e) => sum + e.confidence, 0) / entities.length
            : 0;

        return {
            overall: avgEntityConfidence,
            entities: entityConfidences,
            tables: 0.85
        };
    }

    /**
     * Initialize agent capabilities
     */
    protected initializeCapabilities() {
        return {
            tools: [],
            models: [
                {
                    id: 'gpt-4-vision',
                    name: 'GPT-4 Vision',
                    provider: 'openai',
                    maxTokens: 128000,
                    supportsFunctions: true,
                    supportsVision: true,
                    costPer1KTokens: { input: 0.01, output: 0.03 }
                }
            ],
            maxContextLength: 128000
        };
    }
}

/**
 * Create a new Document Intelligence Agent
 */
export function createDocumentIntelligenceAgent(): DocumentIntelligenceAgent {
    return new DocumentIntelligenceAgent();
}
