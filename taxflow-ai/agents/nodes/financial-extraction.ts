/**
 * TaxFlow AI - Financial Extraction Agent
 * 
 * Specialized agent for extracting and categorizing financial data from
 * parsed documents. Maps raw document data to tax-relevant categories
 * and computes derived financial metrics.
 * 
 * Architecture Decision:
 * - Transforms document output into structured financial data
 * - Applies tax-specific categorization rules
 * - Computes derived values (totals, aggregates)
 */

import { BaseAgent } from './base';
import { AgentContext } from '../types';
import { DocumentOutput, DocumentType, ExtractedEntity, EntityType } from './document-intelligence';

export interface FinancialExtractionInput {
    /** Parsed document from Document Intelligence Agent */
    document: DocumentOutput;
    /** Tax year */
    taxYear: number;
    /** Filing status */
    filingStatus?: FilingStatus;
}

export interface FinancialExtractionOutput {
    /** Extracted financial data */
    financialData: FinancialData;
    /** Income items */
    incomeItems: IncomeItem[];
    /** Expense items */
    expenseItems: ExpenseItem[];
    /** Deduction candidates */
    deductionCandidates: DeductionCandidate[];
    /** Credit eligibility */
    creditEligibility: CreditEligibility[];
    /** Validation results */
    validation: FinancialValidation;
}

export enum FilingStatus {
    SINGLE = 'single',
    MARRIED_FILING_JOINTLY = 'married_filing_jointly',
    MARRIED_FILING_SEPARATELY = 'married_filing_separately',
    HEAD_OF_HOUSEHOLD = 'head_of_household',
    QUALIFYING_SURVIVING_SPOUSE = 'qualifying_surviving_spouse'
}

export interface FinancialData {
    /** Total income */
    totalIncome: number;
    /** Total expenses */
    totalExpenses: number;
    /** Total deductions */
    totalDeductions: number;
    /** Taxable income */
    taxableIncome: number;
    /** Tax liability */
    taxLiability: number;
    /** Credits */
    totalCredits: number;
    /** Refund or amount owed */
    refundOrOwed: number;
}

export interface IncomeItem {
    /** Income ID */
    id: string;
    /** Income type */
    type: IncomeType;
    /** Source description */
    source: string;
    /** Amount */
    amount: number;
    /** Tax form */
    form?: string;
    /** Box number on form */
    boxNumber?: string;
    /** Taxable amount */
    taxableAmount: number;
    /** Whether it's W-2 income */
    isW2: boolean;
}

export enum IncomeType {
    WAGES = 'wages',
    SALARY = 'salary',
    TIPS = 'tips',
    BONUS = 'bonus',
    COMMISSION = 'commission',
    INTEREST = 'interest',
    DIVIDENDS = 'dividends',
    CAPITAL_GAINS = 'capital_gains',
    RENTAL_INCOME = 'rental_income',
    BUSINESS_INCOME = 'business_income',
    PENSION = 'pension',
    ANNUITY = 'annuity',
    SOCIAL_SECURITY = 'social_security',
    UNEMPLOYMENT = 'unemployment',
    ALIMONY = 'alimony',
    OTHER = 'other'
}

export interface ExpenseItem {
    /** Expense ID */
    id: string;
    /** Expense type */
    type: ExpenseType;
    /** Description */
    description: string;
    /** Amount */
    amount: number;
    /** Whether it's deductible */
    isDeductible: boolean;
    /** Deductible as */
    deductionType?: DeductionType;
    /** Supporting document */
    documentId?: string;
}

export enum ExpenseType {
    MEDICAL = 'medical',
    TAXES = 'taxes',
    INTEREST = 'interest',
    CHARITABLE = 'charitable',
    BUSINESS = 'business',
    EDUCATION = 'education',
    HOME_OFFICE = 'home_office',
    TRAVEL = 'travel',
    MEALS = 'meals',
    ENTERTAINMENT = 'entertainment',
    OTHER = 'other'
}

export enum DeductionType {
    STANDARD = 'standard',
    ITEMIZED = 'itemized',
    BUSINESS = 'business',
    ABOVE_THE_LINE = 'above_the_line'
}

export interface DeductionCandidate {
    /** Deduction ID */
    id: string;
    /** Deduction name */
    name: string;
    /** Estimated amount */
    amount: number;
    /** Deduction type */
    type: DeductionType;
    /** Category */
    category: string;
    /** Requirements */
    requirements: string[];
    /** Confidence that this applies */
    confidence: number;
}

export interface CreditEligibility {
    /** Credit ID */
    id: string;
    /** Credit name */
    name: string;
    /** Estimated credit amount */
    estimatedAmount: number;
    /** Whether eligible */
    isEligible: boolean;
    /** Eligibility requirements */
    requirements: EligibilityRequirement[];
    /** Missing requirements */
    missingRequirements?: string[];
}

export interface EligibilityRequirement {
    /** Requirement description */
    description: string;
    /** Whether met */
    isMet: boolean;
    /** Evidence needed */
    evidenceNeeded?: string;
}

export interface FinancialValidation {
    /** Whether data is valid */
    isValid: boolean;
    /** Validation errors */
    errors: ValidationError[];
    /** Validation warnings */
    warnings: ValidationWarning[];
}

export interface ValidationError {
    /** Error code */
    code: string;
    /** Error message */
    message: string;
    /** Affected field */
    field?: string;
}

export interface ValidationWarning {
    /** Warning code */
    code: string;
    /** Warning message */
    message: string;
    /** Affected field */
    field?: string;
    /** Suggestion */
    suggestion?: string;
}

/**
 * Financial Extraction Agent
 * Extracts and categorizes financial data for tax purposes
 */
export class FinancialExtractionAgent extends BaseAgent<FinancialExtractionInput, FinancialExtractionOutput> {
    constructor() {
        super({
            id: 'financial-extraction',
            name: 'Financial Extraction Agent',
            description: 'Extracts and categorizes financial data from parsed documents for tax filing',
            timeout: 60000,
            retry: {
                maxAttempts: 3,
                baseDelay: 1000,
                backoffMultiplier: 2,
                maxDelay: 15000
            }
        });
    }

    /**
     * Main execution logic
     */
    protected async run(input: FinancialExtractionInput, context: AgentContext): Promise<FinancialExtractionOutput> {
        const { document, taxYear } = input;

        // Step 1: Extract income items
        const incomeItems = this.extractIncomeItems(document);

        // Step 2: Extract expense items
        const expenseItems = this.extractExpenseItems(document);

        // Step 3: Identify deduction candidates
        const deductionCandidates = this.identifyDeductionCandidates(expenseItems, incomeItems);

        // Step 4: Check credit eligibility
        const creditEligibility = this.checkCreditEligibility(incomeItems, expenseItems, input.filingStatus);

        // Step 5: Compute financial totals
        const financialData = this.computeFinancialData(incomeItems, expenseItems, deductionCandidates);

        // Step 6: Validate data
        const validation = this.validateFinancialData(financialData, incomeItems, expenseItems);

        return {
            financialData,
            incomeItems,
            expenseItems,
            deductionCandidates,
            creditEligibility,
            validation
        };
    }

    /**
     * Extract income items from document
     */
    private extractIncomeItems(document: DocumentOutput): IncomeItem[] {
        const incomeItems: IncomeItem[] = [];
        const entities = document.entities;

        // Extract based on document type
        switch (document.document.type) {
            case DocumentType.W2:
                incomeItems.push(...this.extractW2Income(document));
                break;
            case DocumentType.FORM_1099:
                incomeItems.push(...this.extract1099Income(document));
                break;
            case DocumentType.BANK_STATEMENT:
                incomeItems.push(...this.extractBankIncome(document));
                break;
        }

        return incomeItems;
    }

    /**
     * Extract W-2 income
     */
    private extractW2Income(document: DocumentOutput): IncomeItem[] {
        const items: IncomeItem[] = [];
        const data = document.document.data as Record<string, unknown>;

        // Box 1 - Wages
        const wages = data.wages as number || 0;
        if (wages > 0) {
            items.push({
                id: this.generateId(),
                type: IncomeType.WAGES,
                source: 'W-2 Box 1',
                amount: wages,
                form: 'W-2',
                boxNumber: '1',
                taxableAmount: wages,
                isW2: true
            });
        }

        // Box 3 - Social Security wages
        const ssWages = data.wages as number || 0;
        if (ssWages > 0) {
            items.push({
                id: this.generateId(),
                type: IncomeType.WAGES,
                source: 'W-2 Box 3 (Social Security)',
                amount: ssWages,
                form: 'W-2',
                boxNumber: '3',
                taxableAmount: ssWages,
                isW2: true
            });
        }

        return items;
    }

    /**
     * Extract 1099 income
     */
    private extract1099Income(document: DocumentOutput): IncomeItem[] {
        const items: IncomeItem[] = [];
        const data = document.document.data as Record<string, unknown>;
        const income = data.income as Record<string, number> || {};

        if (income.box1 !== undefined) {
            items.push({
                id: this.generateId(),
                type: IncomeType.OTHER,
                source: '1099 Interest',
                amount: income.box1,
                form: '1099-INT',
                boxNumber: '1',
                taxableAmount: income.box1,
                isW2: false
            });
        }

        return items;
    }

    /**
     * Extract income from bank statements
     */
    private extractBankIncome(document: DocumentOutput): IncomeItem[] {
        // In production, would analyze transaction patterns
        return [];
    }

    /**
     * Extract expense items from document
     */
    private extractExpenseItems(document: DocumentOutput): ExpenseItem[] {
        const expenseItems: ExpenseItem[] = [];

        // In production, would analyze document data for expenses
        // For now, return based on document type

        return expenseItems;
    }

    /**
     * Identify deduction candidates
     */
    private identifyDeductionCandidates(
        expenses: ExpenseItem[],
        incomeItems: IncomeItem[]
    ): DeductionCandidate[] {
        const candidates: DeductionCandidate[] = [];

        // Check for business expenses
        const businessExpenses = expenses.filter(e => e.type === ExpenseType.BUSINESS);
        if (businessExpenses.length > 0) {
            const total = businessExpenses.reduce((sum, e) => sum + e.amount, 0);
            candidates.push({
                id: this.generateId(),
                name: 'Business Expenses',
                amount: total,
                type: DeductionType.BUSINESS,
                category: 'Business Deductions',
                requirements: ['Documentation of business purpose', 'Receipts or invoices'],
                confidence: 0.9
            });
        }

        // Standard deduction check
        candidates.push({
            id: this.generateId(),
            name: 'Standard Deduction',
            amount: 14600, // 2024 standard deduction for single
            type: DeductionType.STANDARD,
            category: 'Standard Deduction',
            requirements: ['Must not itemize deductions'],
            confidence: 1.0
        });

        return candidates;
    }

    /**
     * Check tax credit eligibility
     */
    private checkCreditEligibility(
        incomeItems: IncomeItem[],
        expenses: ExpenseItem[],
        filingStatus?: FilingStatus
    ): CreditEligibility[] {
        const credits: CreditEligibility[] = [];
        const totalIncome = incomeItems.reduce((sum, i) => sum + i.taxableAmount, 0);

        // Earned Income Tax Credit
        credits.push({
            id: this.generateId(),
            name: 'Earned Income Tax Credit',
            estimatedAmount: 0, // Would calculate based on income
            isEligible: totalIncome > 0 && totalIncome < 60000,
            requirements: [
                { description: 'Earned income', isMet: totalIncome > 0 },
                { description: 'Within income limits', isMet: totalIncome < 60000 }
            ]
        });

        // Child Tax Credit
        credits.push({
            id: this.generateId(),
            name: 'Child Tax Credit',
            estimatedAmount: 0,
            isEligible: false,
            requirements: [
                { description: 'Dependent children', isMet: false }
            ],
            missingRequirements: ['No dependent children identified']
        });

        return credits;
    }

    /**
     * Compute financial data
     */
    private computeFinancialData(
        incomeItems: IncomeItem[],
        expenseItems: ExpenseItem[],
        deductionCandidates: DeductionCandidate[]
    ): FinancialData {
        const totalIncome = incomeItems.reduce((sum, i) => sum + i.taxableAmount, 0);
        const totalExpenses = expenseItems.reduce((sum, e) => sum + e.amount, 0);

        // Calculate total deductions (use greater of standard or itemized)
        const standardDeduction = 14600; // 2024
        const itemizedDeductions = deductionCandidates
            .filter(c => c.type === DeductionType.ITEMIZED)
            .reduce((sum, c) => sum + c.amount, 0);

        const totalDeductions = Math.max(standardDeduction, itemizedDeductions);
        const taxableIncome = Math.max(0, totalIncome - totalDeductions);

        // Calculate rough tax (simplified)
        const taxLiability = this.calculateTax(taxableIncome, 'single');

        return {
            totalIncome,
            totalExpenses,
            totalDeductions,
            taxableIncome,
            taxLiability,
            totalCredits: 0,
            refundOrOwed: -taxLiability // Negative means owe
        };
    }

    /**
     * Calculate simplified tax
     */
    private calculateTax(income: number, status: string): number {
        // Simplified 2024 tax brackets for single
        const brackets = [
            { min: 0, max: 11600, rate: 0.10 },
            { min: 11600, max: 47150, rate: 0.12 },
            { min: 47150, max: 100525, rate: 0.22 },
            { min: 100525, max: 191950, rate: 0.24 },
            { min: 191950, max: 243725, rate: 0.32 },
            { min: 243725, max: 609350, rate: 0.35 },
            { min: 609350, max: Infinity, rate: 0.37 }
        ];

        let tax = 0;
        let remaining = income;

        for (const bracket of brackets) {
            if (remaining <= 0) break;
            const taxableInBracket = Math.min(remaining, bracket.max - bracket.min);
            tax += taxableInBracket * bracket.rate;
            remaining -= taxableInBracket;
        }

        return tax;
    }

    /**
     * Validate financial data
     */
    private validateFinancialData(
        data: FinancialData,
        incomeItems: IncomeItem[],
        expenseItems: ExpenseItem[]
    ): FinancialValidation {
        const errors: ValidationError[] = [];
        const warnings: ValidationWarning[] = [];

        // Check for negative income
        if (data.totalIncome < 0) {
            errors.push({
                code: 'NEGATIVE_INCOME',
                message: 'Total income cannot be negative',
                field: 'totalIncome'
            });
        }

        // Check taxable income vs income
        if (data.taxableIncome > data.totalIncome) {
            errors.push({
                code: 'TAXABLE_EXCEEDS_INCOME',
                message: 'Taxable income cannot exceed total income',
                field: 'taxableIncome'
            });
        }

        // Warning for high deductions
        if (data.totalDeductions > data.totalIncome * 0.8) {
            warnings.push({
                code: 'HIGH_DEDUCTIONS',
                message: 'Deductions are unusually high compared to income',
                field: 'totalDeductions',
                suggestion: 'Review deduction documentation'
            });
        }

        return {
            isValid: errors.length === 0,
            errors,
            warnings
        };
    }

    protected initializeCapabilities() {
        return {
            tools: [],
            models: [],
            maxContextLength: 128000
        };
    }
}

/**
 * Create a new Financial Extraction Agent
 */
export function createFinancialExtractionAgent(): FinancialExtractionAgent {
    return new FinancialExtractionAgent();
}
