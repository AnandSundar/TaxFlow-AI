/**
 * TaxFlow AI - Deduction Discovery Agent
 * 
 * Agent that analyzes financial data to identify potential tax deductions
 * the taxpayer may be eligible for. Scans for common and niche deductions
 * based on income, expenses, and life events.
 * 
 * Architecture Decision:
 * - Proactive deduction discovery increases tax savings
 * - Categories deductions by type and priority
 * - Provides action items for claiming deductions
 */

import { BaseAgent } from './base';
import { AgentContext } from '../types';

export interface DeductionDiscoveryInput {
    /** Financial data */
    financialData: {
        totalIncome: number;
        expenses: ExpenseData[];
        incomeItems: IncomeData[];
    };
    /** Tax year */
    taxYear: number;
    /** Filing status */
    filingStatus: string;
    /** Personal information */
    personalInfo?: PersonalInfo;
}

export interface ExpenseData {
    type: string;
    amount: number;
    description: string;
}

export interface IncomeData {
    type: string;
    amount: number;
    source: string;
}

export interface PersonalInfo {
    age?: number;
    isStudent?: boolean;
    isSelfEmployed?: boolean;
    hasHomeOffice?: boolean;
    hasChildren?: boolean;
    isHomeowner?: boolean;
    hasEducationExpenses?: boolean;
}

export interface DeductionDiscoveryOutput {
    /** Discovered deductions */
    deductions: DiscoveredDeduction[];
    /** Total potential savings */
    totalPotentialSavings: number;
    /** Recommended actions */
    recommendedActions: RecommendedAction[];
    /** High priority items */
    highPriorityItems: string[];
}

export interface DiscoveredDeduction {
    /** Deduction ID */
    id: string;
    /** Deduction name */
    name: string;
    /** Category */
    category: DeductionCategory;
    /** Estimated amount */
    estimatedAmount: number;
    /** Maximum possible */
    maxAmount?: number;
    /** Priority */
    priority: Priority;
    /** Requirements */
    requirements: string[];
    /** Action needed */
    actionNeeded?: string;
    /** Confidence */
    confidence: number;
}

export enum DeductionCategory {
    BUSINESS = 'business',
    MEDICAL = 'medical',
    CHARITABLE = 'charitable',
    EDUCATION = 'education',
    HOME = 'home',
    INVESTMENT = 'investment',
    RETIREMENT = 'retirement',
    STATE_LOCAL_TAXES = 'state_local_taxes',
    OTHER = 'other'
}

export enum Priority {
    HIGH = 'high',
    MEDIUM = 'medium',
    LOW = 'low'
}

export interface RecommendedAction {
    /** Action description */
    action: string;
    /** Priority */
    priority: Priority;
    /** Estimated benefit */
    estimatedBenefit: number;
    /** Effort to implement */
    effort: 'low' | 'medium' | 'high';
}

/**
 * Deduction Discovery Agent
 */
export class DeductionDiscoveryAgent extends BaseAgent<DeductionDiscoveryInput, DeductionDiscoveryOutput> {
    constructor() {
        super({
            id: 'deduction-discovery',
            name: 'Deduction Discovery Agent',
            description: 'Discovers potential tax deductions based on financial data',
            timeout: 45000
        });
    }

    protected async run(input: DeductionDiscoveryInput, context: AgentContext): Promise<DeductionDiscoveryOutput> {
        const deductions: DiscoveredDeduction[] = [];

        // Analyze for various deduction categories
        deductions.push(...this.checkBusinessDeductions(input));
        deductions.push(...this.checkMedicalDeductions(input));
        deductions.push(...this.checkCharitableDeductions(input));
        deductions.push(...this.checkEducationDeductions(input));
        deductions.push(...this.checkHomeDeductions(input));
        deductions.push(...this.checkSALT(input));

        // Sort by priority
        deductions.sort((a, b) => {
            const priorityOrder = { high: 0, medium: 1, low: 2 };
            return priorityOrder[a.priority] - priorityOrder[b.priority];
        });

        // Calculate total potential savings
        const totalPotentialSavings = deductions.reduce((sum, d) => sum + d.estimatedAmount, 0);

        // Generate recommended actions
        const recommendedActions = this.generateRecommendations(deductions);

        // Get high priority items
        const highPriorityItems = deductions
            .filter(d => d.priority === Priority.HIGH)
            .map(d => d.name);

        return {
            deductions,
            totalPotentialSavings,
            recommendedActions,
            highPriorityItems
        };
    }

    private checkBusinessDeductions(input: DeductionDiscoveryInput): DiscoveredDeduction[] {
        const deductions: DiscoveredDeduction[] = [];
        const { isSelfEmployed, hasHomeOffice } = input.personalInfo || {};

        if (isSelfEmployed) {
            deductions.push({
                id: 'self-employment-expense',
                name: 'Self-Employment Expenses',
                category: DeductionCategory.BUSINESS,
                estimatedAmount: input.financialData.totalIncome * 0.15, // Estimate
                maxAmount: input.financialData.totalIncome,
                priority: Priority.HIGH,
                requirements: ['Business expense documentation', 'Receipts'],
                actionNeeded: 'Gather business expense receipts',
                confidence: 0.9
            });
        }

        if (hasHomeOffice) {
            deductions.push({
                id: 'home-office',
                name: 'Home Office Deduction',
                category: DeductionCategory.HOME,
                estimatedAmount: 1500,
                maxAmount: 3000,
                priority: Priority.HIGH,
                requirements: ['Regular and exclusive use of home office', 'Principal place of business'],
                confidence: 0.85
            });
        }

        return deductions;
    }

    private checkMedicalDeductions(input: DeductionDiscoveryInput): DiscoveredDeduction[] {
        const medicalExpenses = input.financialData.expenses
            .filter(e => e.type === 'medical');

        const totalMedical = medicalExpenses.reduce((sum, e) => sum + e.amount, 0);

        if (totalMedical > 0) {
            // Medical expenses only deductible if > 7.5% of AGI
            const threshold = input.financialData.totalIncome * 0.075;
            const deductible = Math.max(0, totalMedical - threshold);

            return [{
                id: 'medical-expenses',
                name: 'Medical Expenses Deduction',
                category: DeductionCategory.MEDICAL,
                estimatedAmount: deductible,
                priority: Priority.MEDIUM,
                requirements: ['Medical expenses > 7.5% of AGI', 'Itemized deductions'],
                confidence: 0.8
            }];
        }

        return [];
    }

    private checkCharitableDeductions(input: DeductionDiscoveryInput): DiscoveredDeduction[] {
        const charitableExpenses = input.financialData.expenses
            .filter(e => e.type === 'charitable');

        const totalCharitable = charitableExpenses.reduce((sum, e) => sum + e.amount, 0);

        if (totalCharitable > 0) {
            return [{
                id: 'charitable-contributions',
                name: 'Charitable Contributions',
                category: DeductionCategory.CHARITABLE,
                estimatedAmount: totalCharitable,
                priority: Priority.MEDIUM,
                requirements: ['Donation receipts', 'Itemized deductions'],
                confidence: 0.95
            }];
        }

        return [];
    }

    private checkEducationDeductions(input: DeductionDiscoveryInput): DiscoveredDeduction[] {
        const { isStudent, hasEducationExpenses } = input.personalInfo || {};
        const educationExpenses = input.financialData.expenses
            .filter(e => e.type === 'education');

        const totalEducation = educationExpenses.reduce((sum, e) => sum + e.amount, 0);

        if (totalEducation > 0) {
            const deductions: DiscoveredDeduction[] = [];

            // Lifetime Learning Credit
            deductions.push({
                id: 'lifetime-learning',
                name: 'Lifetime Learning Credit',
                category: DeductionCategory.EDUCATION,
                estimatedAmount: Math.min(2000, totalEducation * 0.2),
                maxAmount: 2000,
                priority: Priority.HIGH,
                requirements: ['Tuition and fees', 'Income limits apply'],
                confidence: 0.7
            });

            return deductions;
        }

        return [];
    }

    private checkHomeDeductions(input: DeductionDiscoveryInput): DiscoveredDeduction[] {
        const { isHomeowner } = input.personalInfo || {};
        const deductions: DiscoveredDeduction[] = [];

        if (isHomeowner) {
            // Mortgage interest
            deductions.push({
                id: 'mortgage-interest',
                name: 'Mortgage Interest Deduction',
                category: DeductionCategory.HOME,
                estimatedAmount: 5000, // Estimate
                priority: Priority.HIGH,
                requirements: ['Mortgage interest statement (Form 1098)', 'Itemized deductions'],
                confidence: 0.9
            });

            // Property taxes
            deductions.push({
                id: 'property-taxes',
                name: 'Property Taxes',
                category: DeductionCategory.HOME,
                estimatedAmount: 3000, // Estimate
                priority: Priority.HIGH,
                requirements: ['Property tax statements', 'Itemized deductions'],
                confidence: 0.95
            });
        }

        return deductions;
    }

    private checkSALT(input: DeductionDiscoveryInput): DiscoveredDeduction[] {
        // State and Local Taxes (SALT) - capped at $10,000
        const stateTaxes = input.financialData.expenses
            .filter(e => e.type === 'state_tax');

        const totalSALT = stateTaxes.reduce((sum, e) => sum + e.amount, 0);

        if (totalSALT > 0) {
            return [{
                id: 'salt',
                name: 'State and Local Taxes (SALT)',
                category: DeductionCategory.STATE_LOCAL_TAXES,
                estimatedAmount: Math.min(10000, totalSALT),
                maxAmount: 10000,
                priority: Priority.HIGH,
                requirements: ['State tax returns', 'Property tax statements', 'Itemized deductions'],
                confidence: 0.95
            }];
        }

        return [];
    }

    private generateRecommendations(deductions: DiscoveredDeduction[]): RecommendedAction[] {
        return deductions
            .filter(d => d.actionNeeded)
            .map(d => ({
                action: d.actionNeeded!,
                priority: d.priority,
                estimatedBenefit: d.estimatedAmount,
                effort: d.priority === Priority.HIGH ? 'low' as const : 'medium' as const
            }));
    }

    protected initializeCapabilities() {
        return { tools: [], models: [], maxContextLength: 128000 };
    }
}

export function createDeductionDiscoveryAgent(): DeductionDiscoveryAgent {
    return new DeductionDiscoveryAgent();
}
