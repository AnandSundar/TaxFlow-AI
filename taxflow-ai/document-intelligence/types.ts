/**
 * TaxFlow AI - Document Intelligence Types
 * 
 * Type definitions for the document processing pipeline.
 */

export interface DocumentIntelligenceConfig {
    /** Enable OCR */
    enableOcr: boolean;
    /** OCR language */
    ocrLanguage: string;
    /** Extract tables */
    extractTables: boolean;
    /** Extract images */
    extractImages: boolean;
    /** Confidence threshold */
    confidenceThreshold: number;
}

export enum DocumentIntelligenceType {
    PDF = 'pdf',
    IMAGE = 'image',
    SCANNED_PDF = 'scanned_pdf',
    WORD = 'word',
    EXCEL = 'excel'
}

export interface ProcessedDocument {
    /** Document ID */
    id: string;
    /** Document type */
    type: DocumentIntelligenceType;
    /** Number of pages */
    pageCount: number;
    /** Extracted text */
    text: string;
    /** Metadata */
    metadata: DocumentMetadata;
    /** Tables */
    tables: ExtractedTable[];
    /** Entities */
    entities: ExtractedEntity[];
    /** Confidence */
    confidence: number;
}

export interface DocumentMetadata {
    /** Title */
    title?: string;
    /** Author */
    author?: string;
    /** Creation date */
    createdDate?: Date;
    /** Modification date */
    modifiedDate?: Date;
    /** File size */
    fileSize?: number;
    /** MIME type */
    mimeType?: string;
}

export interface ExtractedTable {
    /** Table index */
    index: number;
    /** Page number */
    page: number;
    /** Rows */
    rows: string[][];
    /** Headers */
    headers?: string[];
    /** Confidence */
    confidence: number;
}

export interface ExtractedEntity {
    /** Entity type */
    type: EntityType;
    /** Entity text */
    text: string;
    /** Normalized value */
    normalizedValue?: string;
    /** Confidence score */
    confidence: number;
    /** Bounding box */
    boundingBox?: BoundingBox;
    /** Page number */
    page: number;
}

export enum EntityType {
    // Personal Information
    NAME = 'name',
    SSN = 'ssn',
    EIN = 'ein',
    ADDRESS = 'address',
    PHONE = 'phone',
    EMAIL = 'email',
    DATE = 'date',

    // Financial Information
    MONEY = 'money',
    PERCENTAGE = 'percentage',
    ACCOUNT_NUMBER = 'account_number',
    ROUTING_NUMBER = 'routing_number',

    // Tax-specific
    TAX_YEAR = 'tax_year',
    WAGES = 'wages',
    TAX_WITHHELD = 'tax_withheld',
    EMPLOYER = 'employer',
    EMPLOYEE = 'employee',
    FORM_TYPE = 'form_type',
    BOX_NUMBER = 'box_number',

    // Document
    SIGNATURE = 'signature',
    STAMP = 'stamp',
    DOCUMENT_DATE = 'document_date'
}

export interface BoundingBox {
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface ParserConfig {
    /** Document type */
    type: DocumentIntelligenceType;
    /** Options */
    options?: Record<string, unknown>;
}

export interface ExtractorConfig {
    /** Entity types to extract */
    entityTypes: EntityType[];
    /** Custom patterns */
    customPatterns?: RegexPattern[];
}

export interface RegexPattern {
    name: string;
    pattern: string;
    entityType: EntityType;
}

export interface OCRConfig {
    /** Language */
    language: string;
    /** DPI */
    dpi: number;
    /** Deskew */
    deskew: boolean;
    /** Clean up */
    cleanup: boolean;
}
