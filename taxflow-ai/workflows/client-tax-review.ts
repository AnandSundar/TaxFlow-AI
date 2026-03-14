/**
 * TaxFlow AI - Client Tax Review Workflow
 * 
 * Example workflow demonstrating the complete tax review process.
 * This workflow orchestrates all agents to process a client tax return.
 * 
 * Workflow Steps:
 * 1. Document Intelligence - Parse uploaded documents
 * 2. Financial Extraction - Extract and categorize financial data
 * 3. Deduction Discovery - Find potential deductions
 * 4. Compliance Check - Validate for IRS compliance
 * 5. Summary Generation - Generate final summary
 */

import { GraphEngine } from '../agents/graph/engine';
import {
    GraphDefinition,
    NodeType,
    EdgeType,
    GraphNodeConfig,
    GraphEdge
} from '../agents/graph/types';
import { AgentStatus } from '../agents/types';

/**
 * Client Tax Review Workflow Input
 */
export interface ClientTaxReviewInput {
    /** Client ID */
    clientId: string;
    /** Tax year */
    taxYear: number;
    /** Filing status */
    filingStatus: 'single' | 'married_filing_jointly' | 'married_filing_separately' | 'head_of_household';
    /** Documents to process */
    documents: {
        id: string;
        type: string;
        url: string;
    }[];
}

/**
 * Client Tax Review Workflow Output
 */
export interface ClientTaxReviewOutput {
    /** Workflow execution ID */
    executionId: string;
    /** Status */
    status: 'completed' | 'failed' | 'partial';
    /** Summary */
    summary: {
        totalIncome: number;
        totalDeductions: number;
        taxableIncome: number;
        estimatedTax: number;
        potentialSavings: number;
        complianceIssues: number;
    };
    /** Documents processed */
    documentsProcessed: number;
    /** Deductions found */
    deductionsFound: string[];
    /** Next steps */
    nextSteps: string[];
    /** Execution time */
    executionTimeMs: number;
}

/**
 * Create the client tax review workflow graph
 */
export function createClientTaxReviewWorkflow(): GraphDefinition {
    // Define nodes
    const nodes: GraphNodeConfig[] = [
        {
            id: 'start',
            type: NodeType.START,
            name: 'Start',
            description: 'Workflow start node',
            config: {}
        },
        {
            id: 'document-intelligence',
            type: NodeType.AGENT,
            name: 'Document Intelligence',
            description: 'Parse and extract data from uploaded documents',
            agent: {
                agentType: 'document-intelligence',
                model: 'gpt-4-vision',
                tools: ['search-documents']
            },
            config: {
                extractEntities: true,
                extractTables: true
            }
        },
        {
            id: 'financial-extraction',
            type: NodeType.AGENT,
            name: 'Financial Extraction',
            description: 'Extract and categorize financial data',
            agent: {
                agentType: 'financial-extraction',
                model: 'gpt-4'
            },
            config: {}
        },
        {
            id: 'deduction-discovery',
            type: NodeType.AGENT,
            name: 'Deduction Discovery',
            description: 'Find potential tax deductions',
            agent: {
                agentType: 'deduction-discovery',
                model: 'gpt-4'
            },
            config: {
                taxYear: 2024
            }
        },
        {
            id: 'compliance-check',
            type: NodeType.AGENT,
            name: 'Compliance Check',
            description: 'Validate for IRS compliance',
            agent: {
                agentType: 'compliance-check',
                model: 'gpt-4'
            },
            config: {
                strictMode: true
            }
        },
        {
            id: 'summary-generator',
            type: NodeType.AGENT,
            name: 'Summary Generator',
            description: 'Generate comprehensive tax review summary',
            agent: {
                agentType: 'summary-generator',
                model: 'gpt-4'
            },
            config: {}
        },
        {
            id: 'end',
            type: NodeType.END,
            name: 'End',
            description: 'Workflow end node',
            config: {}
        }
    ];

    // Define edges
    const edges: GraphEdge[] = [
        {
            id: 'start-to-doc-intel',
            source: 'start',
            target: 'document-intelligence',
            type: EdgeType.UNCONDITIONAL
        },
        {
            id: 'doc-intel-to-financial',
            source: 'document-intelligence',
            target: 'financial-extraction',
            type: EdgeType.SUCCESS
        },
        {
            id: 'doc-intel-to-end',
            source: 'document-intelligence',
            target: 'end',
            type: EdgeType.FAILURE
        },
        {
            id: 'financial-to-deduction',
            source: 'financial-extraction',
            target: 'deduction-discovery',
            type: EdgeType.SUCCESS
        },
        {
            id: 'financial-to-end',
            source: 'financial-extraction',
            target: 'end',
            type: EdgeType.FAILURE
        },
        {
            id: 'deduction-to-compliance',
            source: 'deduction-discovery',
            target: 'compliance-check',
            type: EdgeType.SUCCESS
        },
        {
            id: 'deduction-to-end',
            source: 'deduction-discovery',
            target: 'end',
            type: EdgeType.FAILURE
        },
        {
            id: 'compliance-to-summary',
            source: 'compliance-check',
            target: 'summary-generator',
            type: EdgeType.UNCONDITIONAL
        },
        {
            id: 'summary-to-end',
            source: 'summary-generator',
            target: 'end',
            type: EdgeType.UNCONDITIONAL
        }
    ];

    return {
        id: 'client-tax-review',
        name: 'Client Tax Review',
        description: 'Complete tax review workflow for clients',
        version: '1.0.0',
        nodes,
        edges,
        metadata: {
            author: 'TaxFlow AI',
            createdAt: new Date(),
            tags: ['tax', 'review', 'workflow'],
            category: 'tax-preparation',
            estimatedDuration: 300000, // 5 minutes
            complexity: 5
        }
    };
}

/**
 * Execute the client tax review workflow
 */
export async function executeClientTaxReview(
    engine: GraphEngine,
    input: ClientTaxReviewInput
): Promise<ClientTaxReviewOutput> {
    const startTime = Date.now();

    // Create workflow graph
    const workflow = createClientTaxReviewWorkflow();
    engine.registerGraph(workflow);

    // Execute workflow
    const execution = await engine.execute(input, {
        agentId: 'client-tax-review'
    });

    const executionTimeMs = Date.now() - startTime;

    // Parse output
    let summary = {
        totalIncome: 0,
        totalDeductions: 0,
        taxableIncome: 0,
        estimatedTax: 0,
        potentialSavings: 0,
        complianceIssues: 0
    };

    if (execution.output) {
        const output = execution.output as Record<string, unknown>;
        if (output.financialData) {
            const fd = output.financialData as Record<string, number>;
            summary = {
                totalIncome: fd.totalIncome || 0,
                totalDeductions: fd.totalDeductions || 0,
                taxableIncome: fd.taxableIncome || 0,
                estimatedTax: fd.taxLiability || 0,
                potentialSavings: 0,
                complianceIssues: 0
            };
        }
    }

    return {
        executionId: execution.id,
        status: execution.status === 'completed' ? 'completed' : 'failed',
        summary,
        documentsProcessed: input.documents.length,
        deductionsFound: [],
        nextSteps: [
            'Review the generated summary',
            'Address any compliance issues',
            'File the tax return'
        ],
        executionTimeMs
    };
}

/**
 * Example usage
 */
export async function runExample() {
    const engine = new GraphEngine();

    const input: ClientTaxReviewInput = {
        clientId: 'client-123',
        taxYear: 2024,
        filingStatus: 'single',
        documents: [
            { id: 'doc-1', type: 'W2', url: 's3://bucket/w2-2024.pdf' },
            { id: 'doc-2', type: '1099', url: 's3://bucket/1099-2024.pdf' }
        ]
    };

    const result = await executeClientTaxReview(engine, input);

    console.log('Workflow completed:', result.status);
    console.log('Estimated tax:', result.summary.estimatedTax);
}
