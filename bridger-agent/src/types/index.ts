export interface BankAccount {
  id: string;
  name: string;
  accountNumber: string;
  clientId: string;
}

export interface Vendor {
  id: string;
  name: string;
}

export interface Category {
  id: string;
  name: string;
}

export type CategorizationStatus = "NEEDS_REVIEW" | "REVIEWED" | "NEEDS_MORE_INFO";

export interface Categorization {
  id: string;
  reason: string;
  aiGenerated: boolean;
  status: CategorizationStatus;
  confidenceScore: number;
  createdAt: string;
  payee: Vendor | null;
  category: Category | null;
}

export interface Transaction {
  id: string;
  details: string;
  amount: number;
  transactionDate: string;
  bankAccountId: string;
  categorization: Categorization | null;
}
