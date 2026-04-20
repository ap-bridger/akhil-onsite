"use client";

import { useState, useMemo } from "react";
import type { CategorizationStatus } from "@/types";
import { MOCK_BANK_ACCOUNTS, MOCK_CATEGORIES, MOCK_TRANSACTIONS, MOCK_VENDORS } from "@/lib/mock-data";
import type { Transaction } from "@/types";
import { Sidebar } from "@/components/Sidebar/Sidebar";
import { TransactionTable } from "@/components/TransactionTable/TransactionTable";
import { StatusBadge } from "@/components/StatusBadge/StatusBadge";

const STATUS_FILTERS = [
  { value: "ALL", label: "All" },
  { value: "NEEDS_REVIEW", label: "Needs Review" },
  { value: "NEEDS_MORE_INFO", label: "Needs Info" },
  { value: "REVIEWED", label: "Reviewed" },
] as const;
type StatusFilter = (typeof STATUS_FILTERS)[number]["value"];

export default function TransactionsPage() {
  const [activeBankAccountId, setActiveBankAccountId] = useState(MOCK_BANK_ACCOUNTS[0].id);
  const [transactions, setTransactions] = useState<Transaction[]>(MOCK_TRANSACTIONS);
  const [dirtyIds, setDirtyIds] = useState<Set<string>>(new Set());
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [search, setSearch] = useState("");

  const activeAccount = MOCK_BANK_ACCOUNTS.find((a) => a.id === activeBankAccountId);

  function handleUpdate(id: string, patch: Partial<{ reason: string; payeeId: string | null; categoryId: string | null; status: CategorizationStatus }>) {
    setTransactions((prev) => prev.map((tx) => {
      if (tx.id !== id) return tx;
      const existing = tx.categorization;
      const updatedCat = existing
        ? {
            ...existing,
            ...(patch.reason !== undefined ? { reason: patch.reason } : {}),
            ...(patch.status !== undefined ? { status: patch.status } : {}),
            ...(patch.payeeId !== undefined ? { payee: patch.payeeId ? (MOCK_VENDORS.find((v) => v.id === patch.payeeId) ?? existing.payee) : null } : {}),
            ...(patch.categoryId !== undefined ? { category: patch.categoryId ? (MOCK_CATEGORIES.find((c) => c.id === patch.categoryId) ?? existing.category) : null } : {}),
          }
        : {
            id: `cat-${Date.now()}`, reason: patch.reason ?? "", aiGenerated: false, status: (patch.status ?? "NEEDS_REVIEW") as CategorizationStatus,
            confidenceScore: 100, createdAt: new Date().toISOString(),
            payee: patch.payeeId ? (MOCK_VENDORS.find((v) => v.id === patch.payeeId) ?? null) : null,
            category: patch.categoryId ? (MOCK_CATEGORIES.find((c) => c.id === patch.categoryId) ?? null) : null,
          };
      return { ...tx, categorization: updatedCat };
    }));
    if (!("status" in patch && Object.keys(patch).length === 1 && patch.status === "NEEDS_MORE_INFO")) {
      setDirtyIds((prev) => new Set(prev).add(id));
    }
  }

  function handleApprove(id: string) {
    setTransactions((prev) => prev.map((tx) => {
      if (tx.id !== id) return tx;
      const existing = tx.categorization;
      return {
        ...tx,
        categorization: existing
          ? { ...existing, status: "REVIEWED" as CategorizationStatus }
          : { id: `cat-${Date.now()}`, reason: "", aiGenerated: false, status: "REVIEWED" as CategorizationStatus, confidenceScore: 100, createdAt: new Date().toISOString(), payee: null, category: null },
      };
    }));
    setDirtyIds((prev) => { const next = new Set(prev); next.delete(id); return next; });
  }

  const filtered = useMemo(() => {
    return transactions.filter((tx) => {
      if (tx.bankAccountId !== activeBankAccountId) return false;
      if (search) { const q = search.toLowerCase(); if (!tx.details.toLowerCase().includes(q) && !(tx.categorization?.payee?.name.toLowerCase().includes(q))) return false; }
      if (statusFilter === "ALL") return true;
      return (tx.categorization?.status ?? "NEEDS_REVIEW") === statusFilter;
    });
  }, [transactions, activeBankAccountId, search, statusFilter]);

  const counts = useMemo(() => {
    const base = transactions.filter((tx) => tx.bankAccountId === activeBankAccountId);
    return {
      total: base.length,
      needsReview: base.filter((tx) => (tx.categorization?.status ?? "NEEDS_REVIEW") === "NEEDS_REVIEW").length,
      needsInfo: base.filter((tx) => tx.categorization?.status === "NEEDS_MORE_INFO").length,
      reviewed: base.filter((tx) => tx.categorization?.status === "REVIEWED").length,
    };
  }, [transactions, activeBankAccountId]);

  const unsavedCount = dirtyIds.size;

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar bankAccounts={MOCK_BANK_ACCOUNTS} activeBankAccountId={activeBankAccountId}
        onSelectBankAccount={(id) => { setActiveBankAccountId(id); setSearch(""); setStatusFilter("ALL"); }} />

      <main className="flex-1 overflow-y-auto flex flex-col">
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-lg font-semibold text-gray-900">{activeAccount?.name ?? "Transactions"}</h1>
              <p className="text-xs text-gray-400 mt-0.5">{counts.total} transactions</p>
            </div>
            {unsavedCount > 0 && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700 border border-amber-200">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                {unsavedCount} unsaved {unsavedCount === 1 ? "change" : "changes"}
              </span>
            )}
          </div>
          <div className="relative">
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search transactions..."
              className="pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent bg-gray-50 w-56" />
            <svg className="absolute left-2.5 top-2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
            </svg>
          </div>
        </header>

        <div className="px-6 py-4 flex gap-3 flex-wrap">
          {([{ count: counts.needsReview, status: "NEEDS_REVIEW" as const }, { count: counts.needsInfo, status: "NEEDS_MORE_INFO" as const }, { count: counts.reviewed, status: "REVIEWED" as const }] as const).map(({ count, status }) => (
            <button key={status} onClick={() => setStatusFilter(statusFilter === status ? "ALL" : status)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-colors ${statusFilter === status ? "border-indigo-300 bg-indigo-50" : "border-gray-200 bg-white hover:border-gray-300"}`}>
              <StatusBadge status={status} /><span className="font-semibold text-gray-700">{count}</span>
            </button>
          ))}
        </div>

        <div className="px-6 pb-3 flex gap-2">
          {STATUS_FILTERS.map((f) => (
            <button key={f.value} onClick={() => setStatusFilter(f.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${statusFilter === f.value ? "bg-indigo-600 text-white" : "bg-white text-gray-500 border border-gray-200 hover:border-gray-300 hover:text-gray-700"}`}>
              {f.label}
            </button>
          ))}
        </div>

        <div className="mx-6 mb-6 flex-1 bg-white rounded-xl border border-gray-200 overflow-hidden">
          <TransactionTable transactions={filtered} vendors={MOCK_VENDORS} categories={MOCK_CATEGORIES}
            dirtyIds={dirtyIds} onUpdate={handleUpdate} onApprove={handleApprove} />
        </div>
      </main>
    </div>
  );
}
