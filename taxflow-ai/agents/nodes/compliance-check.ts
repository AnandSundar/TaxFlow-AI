/**
 * TaxFlow AI - Compliance Check Agent
 * 
 * Agent responsible for validating tax returns against IRS rules and regulations.
 * Identifies potential errors, missing information, and compliance issues before filing.
 * 
 * Architecture Decision:
 * - Rule-based validation ensures regulatory compliance
 * - Categorizes issues by severity
 * - Provides actionable fixes for identified issues
 */

import { BaseAgent } from './base';
import { AgentContext } from '../types';

export interface ComplianceCheckInput {
    /** Tax return data */
    taxReturn: TaxReturnData;
    /** Tax year */
    taxYear: number;
    /** Filing status */
    filingStatus: string;
}

export interface TaxReturnData {
    income: IncomeSection;
    deductions: DeductionSection;
    credits: CreditSection;
    payments: PaymentSection;
}

export interface IncomeSection {
    wages: number;
    interest: number;
    dividends: number;
    capitalGains: number;
    businessIncome: number;
    rentalIncome: number;
    otherIncome: number;
}

export interface DeductionSection {
    standardDeduction: number;
    itemizedDeductions: ItemizedDeduction[];
}

export interface ItemizedDeduction {
    type: string;
    amount: number;
}

export interface CreditSection {
    childTaxCredit: number;
    earnedIncomeCredit: number;
    educationCredit: number;
}

export interface PaymentSection {
    federalWithholding: number;
    estimatedPayments: number;
    otherPayments: number;
}

export interface ComplianceCheckOutput {
    /** Compliance status */
    status: ComplianceStatus;
    /** Issues found */
    issues: ComplianceIssue[];
    /** Warnings */
    warnings: ComplianceWarning[];
    /** Recommendations */
    recommendations: string[];
    /** Risk score (0-100) */
    riskScore: number;
}

export enum ComplianceStatus {
    PASSED = 'passed',
    PASSED_WITH_WARNINGS = 'passed_with_warnings',
    NEEDS_REVIEW = 'needs_review',
    FAILED = 'failed'
}

export interface ComplianceIssue {
    /** Issue ID */
    id: string;
    /** Severity */
    severity: IssueSeverity;
    /** Category */
    category: IssueCategory;
    /** Description */
    description: string;
    /** Field affected */
    field?: string;
    /** Expected value */
    expectedValue?: unknown;
    /** Actual value */
    actualValue?: unknown;
    /** Fix suggestion */
    fixSuggestion: string;
}

export enum IssueSeverity {
    ERROR = 'error',
    WARNING = 'warning',
    INFO = 'info'
}

export enum IssueCategory {
    MATH_ERROR = 'math_error',
    MISSING_INFO = 'missing_info',
    INCONSISTENCY = 'inconsistency',
    FORM_ERROR = 'form_error',
    DEADLINE = 'deadline',
    LIMIT_EXCEEDED = 'limit_exceeded'
}

/**
 * Compliance Check Agent
 */
export class ComplianceCheckAgent extends BaseAgent<ComplianceCheckInput, ComplianceCheckOutput> {
    constructor() {
        super({
            id: 'compliance-check',
            name: 'Compliance Check Agent',
            description: 'Validates tax returns for IRS compliance and identifies issues',
            timeout: 60000
        });
    }

    protected async run(input: ComplianceCheckInput, context: AgentContext): Promise<ComplianceCheckOutput> {
        const issues: ComplianceIssue[] = [];
        const warnings: ComplianceWarning[] = [];

        // Run all compliance checks
        issues.push(...this.checkMathAccuracy(input));
        issues.push(...this.checkIncomeConsistency(input));
        issues.push(...this.checkDeductionLimits(input));
        issues.push(...this.checkCreditEligibility(input));
        issues.push(...this.checkFilingRequirements(input));

        warnings.push(...this.checkWarnings(input));

        // Determine status
        const status = this.determineStatus(issues, warnings);

        // Calculate risk score
        const riskScore = this.calculateRiskScore(issues, warnings);

        // Generate recommendations
        const recommendations = this.generateRecommendations(issues, warnings);

        return {
            status,
            issues,
            warnings,
            recommendations,
            riskScore
        };
    }

    private checkMathAccuracy(input: ComplianceCheckInput): ComplianceIssue[] {
        const issues: ComplianceIssue[] = [];
        const { income, deductions, credits, payments } = input.taxReturn;

        // Check total income calculation
        const calculatedIncome =
            income.wages +
            income.interest +
            income.dividends +
            income.capitalGains +
            income.businessIncome +
            income.rentalIncome +
            income.otherIncome;

        // Rough check - if large discrepancy, flag it
        if (calculatedIncome > 0 && Math.abs(calculatedIncome - income.wages) > 10000) {
            issues.push({
                id: 'math-income',
                severity: IssueSeverity.ERROR,
                category: IssueCategory.MATH_ERROR,
                description: 'Income components may have calculation error',
                fixSuggestion: 'Review and verify all income fields'
            });
        }

        // Check that withholding doesn't exceed income
        if (payments.federalWithholding > income.wages * 1.5) {
            issues.push({
                id: 'math-withholding',
                severity: IssueSeverity.WARNING,
                category: IssueCategory.INCONSISTENCY,
                description: 'Federal withholding seems unusually high',
                field: 'federalWithholding',
                fixSuggestion: 'Verify withholding amounts are correct'
            });
        }

        return issues;
    }

    private checkIncomeConsistency(input: ComplianceCheckInput): ComplianceIssue[] {
        const issues: ComplianceIssue[] = [];
        const { income } = input.taxReturn;

        // Negative income checks
        if (income.wages < 0 || income.interest < 0 || income.dividends < 0) {
            issues.push({
                id: 'neg-income',
                severity: IssueSeverity.ERROR,
                category: IssueCategory.MATH_ERROR,
                description: 'Income cannot be negative',
                fixSuggestion: 'Correct negative income values'
            });
        }

        // Self-employment income without business
        if (income.businessIncome > 0 && !input.taxReturn.deductions.itemizedDeductions.some(d => d.type === 'business')) {
            // This is fine - just informational
        }

        return issues;
    }

    private checkDeductionLimits(input: ComplianceCheckInput): ComplianceIssue[] {
        const issues: ComplianceIssue[] = [];
        const { deductions } = input.taxReturn;

        // Standard vs Itemized check
        const standardDeduction = this.getStandardDeduction(input.filingStatus);
        const itemizedTotal = deductions.itemizedDeductions.reduce((sum, d) => sum + d.amount, 0);

        if (itemizedTotal > 0 && itemizedTotal < standardDeduction) {
            issues.push({
                id: 'deduct-choice',
                severity: IssueSeverity.INFO,
                category: IssueCategory.INCONSISTENCY,
                description: 'Itemized deductions are less than standard deduction',
                fixSuggestion: `Consider taking standard deduction ($${standardDeduction.toLocaleString()}) instead of itemizing`
            });
        }

        // SALT cap (State and Local Taxes)
        const saltDeduction = deductions.itemizedDeductions.find(d =>
            d.type === 'state_tax' || d.type === 'property_tax'
        );
        if (saltDeduction && saltDeduction.amount > 10000) {
            issues.push({
                id: 'salt-cap',
                severity: IssueSeverity.ERROR,
                category: IssueCategory.LIMIT_EXCEEDED,
                description: 'SALT deduction exceeds $10,000 cap',
                field: 'state_tax',
                expectedValue: 10000,
                actualValue: saltDeduction.amount,
                fixSuggestion: 'Limit SALT deduction to $10,000'
            });
        }

        return issues;
    }

    private checkCreditEligibility(input: ComplianceCheckInput): ComplianceIssue[] {
        const issues: ComplianceIssue[] = [];
        const { credits, income } = input.taxReturn;
        const totalIncome =
            income.wages + income.interest + income.dividends +
            income.capitalGains + income.businessIncome;

        // Child Tax Credit income limits
        if (credits.childTaxCredit > 0) {
            const limit = input.filingStatus === 'single' ? 200000 : 400000;
            if (totalIncome > limit) {
                issues.push({
                    id: 'ctc-limit',
                    severity: IssueSeverity.WARNING,
                    category: IssueCategory.LIMIT_EXCEEDED,
                    description: 'Income may exceed Child Tax Credit eligibility',
                    fixSuggestion: 'Verify Child Tax Credit eligibility based on income'
                });
            }
        }

        // Earned Income Credit
        if (credits.earnedIncomeCredit > 0) {
            if (totalIncome < 1) {
                issues.push({
                    id: 'eic-income',
                    severity: IssueSeverity.WARNING,
                    category: IssueCategory.INCONSISTENCY,
                    description: 'Earned Income Credit requires earned income',
                    fixSuggestion: 'Verify EIC eligibility'
                });
            }
        }

        return issues;
    }

    private checkFilingRequirements(input: ComplianceCheckInput): ComplianceIssue[] {
        const issues: ComplianceIssue[] = [];
        const { income } = input.taxReturn;

        const totalIncome =
            income.wages + income.interest + income.dividends +
            income.capitalGains + income.businessIncome;

        // Filing requirement check
        const filingThreshold = input.filingStatus === 'single' ? 14600 : 29200;
        if (totalIncome < filingThreshold && income.wages === 0) {
            issues.push({
                id: 'filing-required',
                severity: IssueSeverity.INFO,
                category: IssueCategory.MISSING_INFO,
                description: 'Income may be below filing requirement',
                fixSuggestion: 'Verify if filing is required'
            });
        }

        return issues;
    }

    private checkWarnings(input: ComplianceCheckInput): ComplianceWarning[] {
        const warnings: ComplianceWarning[] = [];

        return warnings;
    }

    private determineStatus(issues: ComplianceIssue[], warnings: ComplianceWarning[]): ComplianceStatus {
        const hasErrors = issues.some(i => i.severity === IssueSeverity.ERROR);
        const hasWarnings = issues.some(i => i.severity === IssueSeverity.WARNING) || warnings.length > 0;

        if (hasErrors) return ComplianceStatus.FAILED;
        if (hasWarnings) return ComplianceStatus.NEEDS_REVIEW;
        return ComplianceStatus.PASSED;
    }

    private calculateRiskScore(issues: ComplianceIssue[], warnings: ComplianceWarning[]): number {
        let score = 0;

        for (const issue of issues) {
            switch (issue.severity) {
                case IssueSeverity.ERROR: score += 25; break;
                case IssueSeverity.WARNING: score += 10; break;
                case IssueSeverity.INFO: score += 2; break;
            }
        }

        for (const warning of warnings) {
            score += 5;
        }

        return Math.min(100, score);
    }

    private generateRecommendations(issues: ComplianceIssue[], warnings: ComplianceWarning[]): string[] {
        const recommendations: string[] = [];

        for (const issue of issues) {
            recommendations.push(issue.fixSuggestion);
        }

        return [...new Set(recommendations)];
    }

    private getStandardDeduction(filingStatus: string): number {
        const deductions: Record<string, number> = {
            single: 14600,
            married_filing_jointly: 29200,
            married_filing_separately: 14600,
            head_of_household: 21900
        };
        return deductions[filingStatus] || 14600;
    }
}

export function createComplianceCheckAgent(): ComplianceCheckAgent {
    return new ComplianceCheckAgent();
}

export interface ComplianceWarning {
    code: string;
    message: string;
    field?: string;
}
