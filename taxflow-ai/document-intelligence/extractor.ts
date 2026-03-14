/**
 * TaxFlow AI - Entity Extractor
 * 
 * Extracts financial and tax-relevant entities from parsed documents.
 * Uses regex patterns and NLP for entity extraction.
 */

import { ExtractedEntity, EntityType, ExtractorConfig } from './types';

/**
 * Entity extraction patterns
 */
const EXTRACTION_PATTERNS: Record<EntityType, RegExp[]> = {
    [EntityType.SSN]: [
        /\b\d{3}-\d{2}-\d{4}\b/g,
        /\b\d{9}\b/g
    ],
    [EntityType.EIN]: [
        /\b\d{2}-\d{7}\b/g,
        /\b\d{9}\b/g
    ],
    [EntityType.MONEY]: [
        /\$\s*[\d,]+\.?\d*/g,
        /[\d,]+\.?\d*\s*(?:dollars?|USD)/gi
    ],
    [EntityType.DATE]: [
        /\b\d{1,2}\/\d{1,2}\/\d{2,4}\b/g,
        /\b\w+\s+\d{1,2},?\s+\d{4}\b/g
    ],
    [EntityType.PHONE]: [
        /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g,
        /\(\d{3}\)\s*\d{3}[-.]?\d{4}/g
    ],
    [EntityType.EMAIL]: [
        /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g
    ],
    [EntityType.ADDRESS]: [
        /\d+\s+[\w\s]+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Drive|Dr|Lane|Ln|Court|Ct)/gi
    ],
    [EntityType.TAX_YEAR]: [
        /\b(20\d{2})\b/g,
        /\bTY\d{4}\b/g
    ],
    [EntityType.EMPLOYER]: [
        /Employer:\s*([^\n]+)/gi,
        /Employer Name:\s*([^\n]+)/gi
    ],
    [EntityType.EMPLOYEE]: [
        /Employee:\s*([^\n]+)/gi,
        /Employee Name:\s*([^\n]+)/gi
    ],
    // Financial - default patterns
    [EntityType.WAGES]: [],
    [EntityType.TAX_WITHHELD]: [],
    [EntityType.ACCOUNT_NUMBER]: [],
    [EntityType.ROUTING_NUMBER]: [],
    [EntityType.PERCENTAGE]: [],
    [EntityType.FORM_TYPE]: [],
    [EntityType.BOX_NUMBER]: [],
    [EntityType.NAME]: [],
    [EntityType.SIGNATURE]: [],
    [EntityType.STAMP]: [],
    [EntityType.DOCUMENT_DATE]: []
};

/**
 * Entity extractor
 */
export class EntityExtractor {
    private config: ExtractorConfig;
    private customPatterns: Map<string, RegExp>;

    constructor(config: ExtractorConfig) {
        this.config = config;
        this.customPatterns = new Map();

        // Add custom patterns
        if (config.customPatterns) {
            for (const pattern of config.customPatterns) {
                this.customPatterns.set(pattern.name, new RegExp(pattern.pattern, 'gi'));
            }
        }
    }

    /**
     * Extract entities from text
     */
    extract(text: string, pageNumber: number = 1): ExtractedEntity[] {
        const entities: ExtractedEntity[] = [];

        // Extract using built-in patterns
        for (const entityType of this.config.entityTypes) {
            const patterns = EXTRACTION_PATTERNS[entityType];
            if (!patterns) continue;

            for (const pattern of patterns) {
                const matches = text.matchAll(new RegExp(pattern.source, pattern.flags));
                for (const match of matches) {
                    entities.push({
                        type: entityType,
                        text: match[0],
                        normalizedValue: this.normalizeValue(entityType, match[0]),
                        confidence: this.calculateConfidence(entityType, match[0]),
                        page: pageNumber
                    });
                }
            }
        }

        // Extract using custom patterns
        for (const [name, pattern] of this.customPatterns) {
            const matches = text.matchAll(pattern);
            for (const match of matches) {
                entities.push({
                    type: EntityType.NAME,
                    text: match[0],
                    confidence: 0.7,
                    page: pageNumber
                });
            }
        }

        // Deduplicate entities
        return this.deduplicateEntities(entities);
    }

    /**
     * Normalize entity values
     */
    private normalizeValue(type: EntityType, value: string): string {
        switch (type) {
            case EntityType.MONEY:
                return value.replace(/[$,\s]/g, '');
            case EntityType.SSN:
                return value.replace(/-/g, '');
            case EntityType.EIN:
                return value.replace(/-/g, '');
            case EntityType.PHONE:
                return value.replace(/[^\d]/g, '');
            case EntityType.DATE:
                return value; // Keep as-is for now
            default:
                return value.trim();
        }
    }

    /**
     * Calculate confidence score
     */
    private calculateConfidence(type: EntityType, value: string): number {
        // Higher confidence for well-formed patterns
        switch (type) {
            case EntityType.SSN:
                return value.match(/^\d{3}-\d{2}-\d{4}$/) ? 0.99 : 0.7;
            case EntityType.EIN:
                return value.match(/^\d{2}-\d{7}$/) ? 0.99 : 0.7;
            case EntityType.MONEY:
                return value.startsWith('$') ? 0.95 : 0.8;
            case EntityType.EMAIL:
                return value.includes('@') && value.includes('.') ? 0.98 : 0.6;
            case EntityType.PHONE:
                return value.match(/^\(\d{3}\)/) ? 0.95 : 0.8;
            default:
                return 0.8;
        }
    }

    /**
     * Remove duplicate entities
     */
    private deduplicateEntities(entities: ExtractedEntity[]): ExtractedEntity[] {
        const seen = new Map<string, ExtractedEntity>();

        for (const entity of entities) {
            const key = `${entity.type}:${entity.text}`;
            if (!seen.has(key)) {
                seen.set(key, entity);
            }
        }

        return Array.from(seen.values());
    }

    /**
     * Filter entities by minimum confidence
     */
    filterByConfidence(entities: ExtractedEntity[], threshold: number): ExtractedEntity[] {
        return entities.filter(e => e.confidence >= threshold);
    }

    /**
     * Group entities by type
     */
    groupByType(entities: ExtractedEntity[]): Map<EntityType, ExtractedEntity[]> {
        const grouped = new Map<EntityType, ExtractedEntity[]>();

        for (const entity of entities) {
            if (!grouped.has(entity.type)) {
                grouped.set(entity.type, []);
            }
            grouped.get(entity.type)!.push(entity);
        }

        return grouped;
    }
}

/**
 * Create entity extractor
 */
export function createEntityExtractor(config?: Partial<ExtractorConfig>): EntityExtractor {
    return new EntityExtractor({
        entityTypes: Object.values(EntityType),
        customPatterns: [],
        ...config
    });
}
