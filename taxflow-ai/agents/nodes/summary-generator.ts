/**
 * TaxFlow AI - Summary Generator Agent
 * 
 * Agent responsible for generating comprehensive summaries of the tax
 * preparation process, including documents processed, deductions found,
 * and final tax situation.
 * 
 * Architecture Decision:
 * - Aggregates results from all previous agents
 * - Generates human-readable summaries
 * - Provides actionable next steps
 */

import { BaseAgent } from './base';
import { AgentContext } from '../types';

export interface SummaryGeneratorInput {
    /** Document processing results */
    documents: DocumentSummary[];
    /** Financial extraction results */
    financialData: FinancialSummary;
    /** Deduction discovery results */
    deductions: DeductionSummary;
    /** Compliance check results */
    compliance: ComplianceSummary;
}

export interface DocumentSummary {
    documentId: string;
    documentType: string;
    status: 'processed' | 'pending' | 'failed';
    entities: number;
}

export interface FinancialSummary {
    totalIncome: number;
    totalExpenses: number;
    totalDeductions: number;
    taxableIncome: number;
    estimatedTax: number;
}

export interface DeductionSummary {
    discovered: DeductionItem[];
    totalPotentialSavings: number;
}

export interface DeductionItem {
    name: string;
    amount: number;
    category: string;
}

export interface ComplianceSummary {
    status: string;
    issues: number;
    warnings: number;
    riskScore: number;
}

export interface SummaryGeneratorOutput {
    /** Executive summary */
    executiveSummary: string;
    /** Income breakdown */
    incomeBreakdown: IncomeBreakdown;
    /** Deduction summary */
    deductionSummary: DeductionBreakdown;
    /** Tax liability */
    taxLiability: TaxLiabilitySummary;
    /** Action items */
    actionItems: ActionItem[];
    /** Documents summary */
    documentsSummary: DocumentsSummary;
    /** Next steps */
    nextSteps: string[];
}

export interface IncomeBreakdown {
    wages: number;
    interest: number;
    dividends: number;
    capitalGains: number;
    businessIncome: number;
    otherIncome: number;
    total: number;
}

export interface DeductionBreakdown {
    standardDeduction: number;
    itemizedDeductions: DeductionItem[];
    totalDeductions: number;
}

export interface TaxLiabilitySummary {
    grossTax: number;
    credits: number;
    payments: number;
    refundOrOwed: number;
}

export interface ActionItem {
    priority: 'high' | 'medium' | 'low';
    action: string;
    reason: string;
}

export interface DocumentsSummary {
    processed: number;
    pending: number;
    failed: number;
    types: Record<string, number>;
}

/**
 * Summary Generator Agent
 */
export class SummaryGeneratorAgent extends BaseAgent<SummaryGeneratorInput, SummaryGeneratorOutput> {
    constructor() {
        super({
            id: 'summary-generator',
            name: 'Summary Generator Agent',
            description: 'Generates comprehensive summaries of tax preparation',
            timeout: 30000
        });
    }

    protected async run(input: SummaryGeneratorInput, context: AgentContext): Promise<SummaryGeneratorOutput> {
        // Generate income breakdown
        const incomeBreakdown = this.generateIncomeBreakdown(input.financialData);

        // Generate deduction breakdown
        const deductionBreakdown = this.generateDeductionBreakdown(input.deductions);

        // Generate tax liability summary
        const taxLiability = this.generateTaxLiability(input.financialData);

        // Generate documents summary
        const documentsSummary = this.generateDocumentsSummary(input.documents);

        // Generate action items
        const actionItems = this.generateActionItems(input);

        // Generate executive summary
        const executiveSummary = this.generateExecutiveSummary(
            input.financialData,
            input.deductions,
            input.compliance
        );

        // Generate next steps
        const nextSteps = this.generateNextSteps(input);

        return {
            executiveSummary,
            incomeBreakdown,
            deductionSummary: deductionBreakdown,
            taxLiability,
            actionItems,
            documentsSummary,
            nextSteps
        };
    }

    private generateIncomeBreakdown(financialData: FinancialSummary): IncomeBreakdown {
        // In production, would use actual breakdown from financial extraction
        return {
            wages: financialData.totalIncome * 0.7,
            interest: financialData.totalIncome * 0.05,
            dividends: financialData.totalIncome * 0.1,
            capitalGains: financialData.totalIncome * 0.05,
            businessIncome: financialData.totalIncome * 0.05,
            otherIncome: financialData.totalIncome * 0.05,
            total: financialData.totalIncome
        };
    }

    private generateDeductionBreakdown(deductions: DeductionSummary): DeductionBreakdown {
        return {
            standardDeduction: 14600, // 2024
            itemizedDeductions: deductions.discovered,
            totalDeductions: deductions.discovered.reduce((sum, d) => sum + d.amount, 0)
        };
    }

    private generateTaxLiability(financialData: FinancialSummary): TaxLiabilitySummary {
        return {
            grossTax: financialData.estimatedTax,
            credits: 0,
            payments: 0,
            refundOrOwed: -financialData.estimatedTax
        };
    }

    private generateDocumentsSummary(documents: DocumentSummary[]): DocumentsSummary {
        const types: Record<string, number> = {};

        for (const doc of documents) {
            types[doc.documentType] = (types[doc.documentType] || 0) + 1;
        }

        return {
            processed: documents.filter(d => d.status === 'processed').length,
            pending: documents.filter(d => d.status === 'pending').length,
            failed: documents.filter(d => d.status === 'failed').length,
            types
        };
    }

    private generateActionItems(input: SummaryGeneratorInput): ActionItem[] {
        const items: ActionItem[] = [];

        // Check for pending documents
        if (input.documents.some(d => d.status === 'pending')) {
            items.push({
                priority: 'high',
                action: 'Upload pending documents',
                reason: 'Some documents need to be processed before filing'
            });
        }

        // Check compliance issues
        if (input.compliance.issues > 0) {
            items.push({
                priority: 'high',
                action: 'Review compliance issues',
                reason: `${input.compliance.issues} issues need attention before filing`
            });
        }

        // Check for potential savings
        if (input.deductions.totalPotentialSavings > 0) {
            items.push({
                priority: 'medium',
                action: 'Review deduction opportunities',
                reason: `Potential savings of $${input.deductions.totalPotentialSavings.toLocaleString()} identified`
            });
        }

        return items;
    }

    private generateExecutiveSummary(
        financialData: FinancialSummary,
        deductions: DeductionSummary,
        compliance: ComplianceSummary
    ): string {
        return `Tax Return Summary for 2024\n\n` +
            `Total Income: $${financialData.totalIncome.toLocaleString()}\n` +
            `Total Deductions: $${financialData.totalDeductions.toLocaleString()}\n` +
            `Taxable Income: $${financialData.taxableIncome.toLocaleString()}\n` +
            `Estimated Tax: $${financialData.estimatedTax.toLocaleString()}\n\n` +
            `Deductions Found: ${deductions.discovered.length}\n` +
            `Potential Savings: $${deductions.totalPotentialSavings.toLocaleString()}\n\n` +
            `Compliance Status: ${compliance.status}\n` +
            `Risk Score: ${compliance.riskScore}/100`;
    }

    private generateNextSteps(input: SummaryGeneratorInput): string[] {
        const steps: string[] = [];

        if (input.compliance.issues > 0) {
            steps.push('Address all compliance issues');
        }

        if (input.documents.some(d => d.status === 'pending')) {
            steps.push('Upload remaining required documents');
        }

        steps.push('Review and approve the tax return');
        steps.push('Sign and file the return');

        return steps;
    }

    protected initializeCapabilities() {
        return { tools: [], models: [], maxContextLength: 128000 };
    }
}

export function createSummaryGeneratorAgent(): SummaryGeneratorAgent {
    return new SummaryGeneratorAgent();
}
