"use client";

import { useState, useMemo, useCallback } from "react";
import { useQuery, useMutation } from "@apollo/client";
import type { CategorizationStatus, Transaction, BankAccount, Vendor, Category } from "@/types";
import { GET_BANK_ACCOUNTS, GET_TRANSACTIONS, GET_VENDORS, GET_CATEGORIES } from "@/client/graphql/queries";
import { CATEGORIZE_TRANSACTION } from "@/client/graphql/mutations";
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

interface PendingEdit {
  reason?: string;
  payeeId?: string | null;
  categoryId?: string | null;
}

export default function TransactionsPage() {
  const { data: baData, loading: baLoading } = useQuery<{ bankAccounts: BankAccount[] }>(GET_BANK_ACCOUNTS);
  const { data: vendorData } = useQuery<{ vendors: Vendor[] }>(GET_VENDORS);
  const { data: categoryData } = useQuery<{ categories: Category[] }>(GET_CATEGORIES);

  const bankAccounts = useMemo(() => baData?.bankAccounts ?? [], [baData]);
  const vendors = useMemo(() => vendorData?.vendors ?? [], [vendorData]);
  const categories = useMemo(() => categoryData?.categories ?? [], [categoryData]);

  const [activeBankAccountId, setActiveBankAccountId] = useState<string | null>(null);
  const effectiveAccountId = activeBankAccountId ?? bankAccounts[0]?.id ?? null;

  const { data: txData, loading: txLoading, refetch: refetchTransactions } = useQuery<{ transactions: Transaction[] }>(
    GET_TRANSACTIONS,
    { variables: { bankAccountId: effectiveAccountId }, skip: !effectiveAccountId },
  );

  const serverTransactions = useMemo(() => txData?.transactions ?? [], [txData]);

  const [pendingEdits, setPendingEdits] = useState<Record<string, PendingEdit>>({});
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [search, setSearch] = useState("");

  const [categorize, { loading: saving }] = useMutation(CATEGORIZE_TRANSACTION);

  const transactions: Transaction[] = useMemo(() => {
    return serverTransactions.map((tx) => {
      const edits = pendingEdits[tx.id];
      if (!edits) return tx;
      const cat = tx.categorization;
      const patchedPayee = edits.payeeId !== undefined
        ? (edits.payeeId ? (vendors.find((v) => v.id === edits.payeeId) ?? cat?.payee ?? null) : null)
        : (cat?.payee ?? null);
      const patchedCategory = edits.categoryId !== undefined
        ? (edits.categoryId ? (categories.find((c) => c.id === edits.categoryId) ?? cat?.category ?? null) : null)
        : (cat?.category ?? null);
      const patchedReason = edits.reason !== undefined ? edits.reason : (cat?.reason ?? "");

      return {
        ...tx,
        categorization: cat
          ? { ...cat, payee: patchedPayee, category: patchedCategory, reason: patchedReason }
          : {
              id: `pending-${tx.id}`,
              reason: patchedReason,
              aiGenerated: false,
              status: "NEEDS_REVIEW" as CategorizationStatus,
              confidenceScore: 0,
              createdAt: new Date().toISOString(),
              payee: patchedPayee,
              category: patchedCategory,
            },
      };
    });
  }, [serverTransactions, pendingEdits, vendors, categories]);

  const dirtyIds = useMemo(() => new Set(Object.keys(pendingEdits)), [pendingEdits]);

  const handleUpdate = useCallback(
    (id: string, patch: Partial<{ reason: string; payeeId: string | null; categoryId: string | null; status: CategorizationStatus }>) => {
      if (patch.status === "NEEDS_MORE_INFO") {
        const tx = transactions.find((t) => t.id === id);
        const edits = pendingEdits[id] ?? {};
        const payeeName = edits.payeeId !== undefined
          ? (edits.payeeId ? (vendors.find((v) => v.id === edits.payeeId)?.name ?? null) : null)
          : (tx?.categorization?.payee?.name ?? null);
        const categoryId = edits.categoryId !== undefined ? edits.categoryId : (tx?.categorization?.category?.id ?? null);
        const reason = edits.reason !== undefined ? edits.reason : (tx?.categorization?.reason ?? "Needs more info");

        categorize({
          variables: {
            transactionId: id,
            status: "NEEDS_MORE_INFO",
            categoryId,
            payee: payeeName,
            reason: reason || "Needs more info",
          },
        }).then(() => {
          setPendingEdits((prev) => { const next = { ...prev }; delete next[id]; return next; });
          refetchTransactions();
        });
        return;
      }

      setPendingEdits((prev) => ({
        ...prev,
        [id]: { ...prev[id], ...patch },
      }));
    },
    [transactions, pendingEdits, vendors, categorize, refetchTransactions],
  );

  const handleApprove = useCallback(
    async (id: string) => {
      const tx = transactions.find((t) => t.id === id);
      if (!tx) return;

      const edits = pendingEdits[id] ?? {};
      const payeeName = edits.payeeId !== undefined
        ? (edits.payeeId ? (vendors.find((v) => v.id === edits.payeeId)?.name ?? null) : null)
        : (tx.categorization?.payee?.name ?? null);
      const categoryId = edits.categoryId !== undefined ? edits.categoryId : (tx.categorization?.category?.id ?? null);
      const reason = edits.reason !== undefined ? edits.reason : (tx.categorization?.reason ?? "Approved");

      if (!categoryId) return;

      await categorize({
        variables: {
          transactionId: id,
          status: "REVIEWED",
          categoryId,
          payee: payeeName,
          reason: reason || "Approved",
        },
      });

      setPendingEdits((prev) => { const next = { ...prev }; delete next[id]; return next; });
      refetchTransactions();
    },
    [transactions, pendingEdits, vendors, categorize, refetchTransactions],
  );

  const activeAccount = bankAccounts.find((a) => a.id === effectiveAccountId);

  const filtered = useMemo(() => {
    return transactions.filter((tx) => {
      if (search) {
        const q = search.toLowerCase();
        if (!tx.details.toLowerCase().includes(q) && !(tx.categorization?.payee?.name.toLowerCase().includes(q))) return false;
      }
      if (statusFilter === "ALL") return true;
      return (tx.categorization?.status ?? "NEEDS_REVIEW") === statusFilter;
    });
  }, [transactions, search, statusFilter]);

  const counts = useMemo(() => ({
    total: transactions.length,
    needsReview: transactions.filter((tx) => (tx.categorization?.status ?? "NEEDS_REVIEW") === "NEEDS_REVIEW").length,
    needsInfo: transactions.filter((tx) => tx.categorization?.status === "NEEDS_MORE_INFO").length,
    reviewed: transactions.filter((tx) => tx.categorization?.status === "REVIEWED").length,
  }), [transactions]);

  const unsavedCount = dirtyIds.size;

  if (baLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Loading accounts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar bankAccounts={bankAccounts} activeBankAccountId={effectiveAccountId ?? ""}
        onSelectBankAccount={(id) => { setActiveBankAccountId(id); setSearch(""); setStatusFilter("ALL"); setPendingEdits({}); }} />

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
            {saving && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700 border border-indigo-200">
                <div className="w-3 h-3 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                Saving...
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
          {txLoading ? (
            <div className="flex items-center justify-center py-24">
              <div className="flex flex-col items-center gap-3">
                <div className="w-6 h-6 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                <p className="text-sm text-gray-400">Loading transactions...</p>
              </div>
            </div>
          ) : (
            <TransactionTable transactions={filtered} vendors={vendors} categories={categories}
              dirtyIds={dirtyIds} onUpdate={handleUpdate} onApprove={handleApprove} />
          )}
        </div>
      </main>
    </div>
  );
}
