/**
 * TaxFlow AI - Sample Tax Knowledge
 * 
 * Sample tax regulation documents for the knowledge base.
 * These would typically be loaded from external sources.
 */

import { Document, DocumentType } from '../types';

/**
 * Sample IRS Publication 501 - Standard Deduction
 */
export const PUBLICATION_501_STANDARD_DEDUCTION: Document = {
    id: 'irs-pub-501-standard-deduction',
    title: 'IRS Publication 501: Standard Deduction',
    content: `
Standard Deduction

For 2024, the standard deduction amounts are:

- Single filers or married filing separately: $14,600
- Married filing jointly: $29,200
- Head of household: $21,900
- Qualifying surviving spouse: $29,200

Additional Standard Deduction for Age 65 or Older or Blind

If you are age 65 or older or blind, you can claim an additional standard deduction amount:
- Single: Additional $1,950 (or $3,900 if 65+ and blind)
- Married filing jointly: Additional $1,550 each (or $3,100 each if both 65+)

Who Should Itemize

You should itemize if your itemized deductions are greater than your standard deduction.
Common itemized deductions include:
- Medical expenses (subject to 7.5% AGI floor)
- State and local taxes (SALT) - capped at $10,000
- Mortgage interest
- Charitable contributions
- Casualty and theft losses
  `.trim(),
    type: DocumentType.IRS_PUBLICATION,
    source: 'IRS Publication 501 (2024)',
    url: 'https://irs.gov/pub501',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    metadata: { taxYear: 2024 }
};

/**
 * Sample tax brackets for 2024
 */
export const TAX_BRACKETS_2024: Document = {
    id: 'tax-brackets-2024',
    title: '2024 Federal Tax Brackets',
    content: `
2024 Federal Income Tax Brackets

For Single Filers:
- 10%: $0 - $11,600
- 12%: $11,601 - $47,150
- 22%: $47,151 - $100,525
- 24%: $100,526 - $191,950
- 32%: $191,951 - $243,725
- 35%: $243,726 - $609,350
- 37%: Over $609,350

For Married Filing Jointly:
- 10%: $0 - $23,200
- 12%: $23,201 - $94,300
- 22%: $94,301 - $201,050
- 24%: $201,051 - $383,900
- 32%: $383,901 - $487,450
- 35%: $487,451 - $731,200
- 37%: Over $731,200
  `.trim(),
    type: DocumentType.TAX_CODE,
    source: 'IRS Revenue Procedure 2023-34',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    metadata: { taxYear: 2024 }
};

/**
 * Common tax deductions
 */
export const COMMON_DEDUCTIONS: Document = {
    id: 'common-deductions',
    title: 'Common Tax Deductions',
    content: `
Above-the-Line Deductions (Reduce AGI)
- Traditional IRA contributions
- Student loan interest (up to $2,500)
- Educator expenses (up to $300)
- HSA contributions
- Self-employment expenses
- Alimony payments (pre-2019 divorces)

Itemized Deductions
- Medical and dental expenses (over 7.5% of AGI)
- State and local taxes (SALT) - $10,000 cap
- Mortgage interest (on up to $750,000 of debt)
- Charitable contributions (up to 60% of AGI)
- Casualty and theft losses (over 10% of AGI)

Standard Deduction (2024)
- Single: $14,600
- Married Filing Jointly: $29,200
- Head of Household: $21,900
  `.trim(),
    type: DocumentType.IRS_PUBLICATION,
    source: 'IRS Publication 502',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    metadata: { taxYear: 2024 }
};

/**
 * Tax credits overview
 */
export const TAX_CREDITS: Document = {
    id: 'tax-credits',
    title: 'Common Tax Credits',
    content: `
Refundable Tax Credits
- Earned Income Tax Credit (EITC)
- Child Tax Credit (partially refundable)
- American Opportunity Credit (partially refundable)
- Premium Tax Credit

Non-Refundable Tax Credits
- Lifetime Learning Credit
- Child and Dependent Care Credit
- Saver's Credit (Retirement Savings Credit)
- Foreign Tax Credit
- Education Credits
- Elderly or Disabled Credit

Income Limits
- Child Tax Credit: $200,000 (single), $400,000 (married)
- Earned Income Tax Credit: Varies by family size
- American Opportunity Credit: $80,000 (single), $160,000 (married)
  `.trim(),
    type: DocumentType.IRS_PUBLICATION,
    source: 'IRS Publication 502',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    metadata: { taxYear: 2024 }
};

/**
 * Self-employment taxes
 */
export const SELF_EMPLOYMENT_TAX: Document = {
    id: 'self-employment-tax',
    title: 'Self-Employment Tax',
    content: `
Self-Employment Tax Rate

The self-employment tax rate is 15.3%:
- 12.4% for Social Security (on income up to $168,600 for 2024)
- 2.9% for Medicare (no income limit)

Net Earnings

Calculate net earnings from self-employment:
- Gross income - Business expenses = Net self-employment income
- Multiply by 92.35% = Net earnings for SE tax

Deducting SE Tax

You can deduct half of your SE tax from your income:
- Deductible portion = SE tax × 50%
- This reduces your adjusted gross income

Quarterly Payments

Self-employed individuals should make quarterly estimated tax payments:
- Due dates: April 15, June 15, September 15, January 15
- Use Form 1040-ES to calculate payments
  `.trim(),
    type: DocumentType.IRS_PUBLICATION,
    source: 'IRS Publication 535',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    metadata: { taxYear: 2024 }
};

/**
 * Get all sample documents
 */
export function getTaxKnowledgeDocuments(): Document[] {
    return [
        PUBLICATION_501_STANDARD_DEDUCTION,
        TAX_BRACKETS_2024,
        COMMON_DEDUCTIONS,
        TAX_CREDITS,
        SELF_EMPLOYMENT_TAX
    ];
}
