import type { BankAccount, Category, Transaction, Vendor } from "@/types";

export const MOCK_VENDORS: Vendor[] = [
  { id: "v-1", name: "Square Inc" },
  { id: "v-2", name: "Gusto" },
  { id: "v-3", name: "Kwan Family Trust" },
  { id: "v-4", name: "PG&E" },
  { id: "v-5", name: "Bossen Food Corp" },
  { id: "v-6", name: "Costco Wholesale" },
  { id: "v-7", name: "Next Insurance" },
  { id: "v-8", name: "Toast Inc" },
];

export const MOCK_CATEGORIES: Category[] = [
  { id: "c-1", name: "Revenue" },
  { id: "c-2", name: "COGS - Tea & Pearls" },
  { id: "c-3", name: "Rent" },
  { id: "c-4", name: "Payroll" },
  { id: "c-5", name: "Utilities" },
  { id: "c-6", name: "Software & Subscriptions" },
  { id: "c-7", name: "Insurance" },
  { id: "c-8", name: "Office & Cleaning Supplies" },
  { id: "c-9", name: "Uncategorized" },
];

export const MOCK_BANK_ACCOUNTS: BankAccount[] = [
  { id: "ba-1", name: "Operating Checking", accountNumber: "ba-acct-001", clientId: "cl-1" },
];

export const MOCK_TRANSACTIONS: Transaction[] = [
  { id: "t-1", details: "ACH DEBIT KWAN FAMILY TRUST RENT JAN", amount: -3500, transactionDate: "2026-01-02T20:00:00Z", bankAccountId: "ba-1",
    categorization: { id: "cat-1", reason: "Recurring monthly rent.", aiGenerated: true, status: "REVIEWED", confidenceScore: 99, createdAt: "2026-01-02T20:00:00Z", payee: { id: "v-3", name: "Kwan Family Trust" }, category: { id: "c-3", name: "Rent" } } },
  { id: "t-2", details: "SQUARESUP DEPOSIT 260103 MOGEE TEA", amount: 1124.4, transactionDate: "2026-01-03T20:00:00Z", bankAccountId: "ba-1",
    categorization: { id: "cat-2", reason: "Daily Square merchant deposit.", aiGenerated: true, status: "REVIEWED", confidenceScore: 97, createdAt: "2026-01-03T20:00:00Z", payee: { id: "v-1", name: "Square Inc" }, category: { id: "c-1", name: "Revenue" } } },
  { id: "t-3", details: "BOSSEN FOOD CORP ONLINE #48219", amount: -612.8, transactionDate: "2026-01-05T20:00:00Z", bankAccountId: "ba-1",
    categorization: { id: "cat-3", reason: "Wholesale tapioca pearls and syrups.", aiGenerated: true, status: "REVIEWED", confidenceScore: 96, createdAt: "2026-01-05T20:00:00Z", payee: { id: "v-5", name: "Bossen Food Corp" }, category: { id: "c-2", name: "COGS - Tea & Pearls" } } },
  { id: "t-4", details: "GUSTO PAY 8GXK9Q", amount: -5820.44, transactionDate: "2026-01-09T20:00:00Z", bankAccountId: "ba-1",
    categorization: { id: "cat-4", reason: "Bi-weekly payroll run.", aiGenerated: true, status: "REVIEWED", confidenceScore: 98, createdAt: "2026-01-09T20:00:00Z", payee: { id: "v-2", name: "Gusto" }, category: { id: "c-4", name: "Payroll" } } },
  { id: "t-5", details: "PG&E WEB ONLINE PAYMENT", amount: -412.77, transactionDate: "2026-01-12T20:00:00Z", bankAccountId: "ba-1",
    categorization: { id: "cat-5", reason: "Monthly electric utility.", aiGenerated: true, status: "REVIEWED", confidenceScore: 99, createdAt: "2026-01-12T20:00:00Z", payee: { id: "v-4", name: "PG&E" }, category: { id: "c-5", name: "Utilities" } } },
  { id: "t-6", details: "POS COSTCO WHSE #478 OAKLAND CA", amount: -287.44, transactionDate: "2026-01-14T20:00:00Z", bankAccountId: "ba-1",
    categorization: { id: "cat-6", reason: "Costco — could be packaging or cleaning supplies, needs receipt.", aiGenerated: true, status: "NEEDS_REVIEW", confidenceScore: 62, createdAt: "2026-01-14T20:00:00Z", payee: { id: "v-6", name: "Costco Wholesale" }, category: { id: "c-8", name: "Office & Cleaning Supplies" } } },
  { id: "t-7", details: "AMAZON.COM*RT4X91KQ3 SEATTLE WA", amount: -84.27, transactionDate: "2026-01-20T20:00:00Z", bankAccountId: "ba-1",
    categorization: { id: "cat-7", reason: "Amazon purchase — cannot determine if business or personal. Attach receipt.", aiGenerated: true, status: "NEEDS_MORE_INFO", confidenceScore: 35, createdAt: "2026-01-20T20:00:00Z", payee: null, category: null } },
  { id: "t-8", details: "NEXT INS PREMIUM 260127", amount: -218, transactionDate: "2026-01-27T20:00:00Z", bankAccountId: "ba-1",
    categorization: { id: "cat-8", reason: "Monthly small-business insurance premium.", aiGenerated: true, status: "REVIEWED", confidenceScore: 98, createdAt: "2026-01-27T20:00:00Z", payee: { id: "v-7", name: "Next Insurance" }, category: { id: "c-7", name: "Insurance" } } },
  { id: "t-9", details: "TST* SOFTWARE FEE 22099", amount: -165, transactionDate: "2026-02-03T20:00:00Z", bankAccountId: "ba-1",
    categorization: { id: "cat-9", reason: "Monthly Toast POS software fee.", aiGenerated: true, status: "REVIEWED", confidenceScore: 96, createdAt: "2026-02-03T20:00:00Z", payee: { id: "v-8", name: "Toast Inc" }, category: { id: "c-6", name: "Software & Subscriptions" } } },
  { id: "t-10", details: "VENMO PAYMENT *JXKQ221", amount: -45, transactionDate: "2026-03-15T20:00:00Z", bankAccountId: "ba-1",
    categorization: { id: "cat-10", reason: "Outbound Venmo — no memo, can't map to vendor or category.", aiGenerated: true, status: "NEEDS_REVIEW", confidenceScore: 50, createdAt: "2026-03-15T20:00:00Z", payee: null, category: { id: "c-9", name: "Uncategorized" } } },
  { id: "t-11", details: "ZELLE FROM M WONG", amount: 5000, transactionDate: "2026-01-29T20:00:00Z", bankAccountId: "ba-1",
    categorization: null },
];
