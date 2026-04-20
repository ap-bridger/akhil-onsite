"use client";

import { useState } from "react";
import type { Category, CategorizationStatus, Transaction, Vendor } from "@/types";
import { StatusBadge } from "@/components/StatusBadge/StatusBadge";

interface Props {
  transaction: Transaction;
  vendors: Vendor[];
  categories: Category[];
  isDirty: boolean;
  onUpdate: (id: string, patch: Partial<{ reason: string; payeeId: string | null; categoryId: string | null; status: CategorizationStatus }>) => void;
  onApprove: (id: string) => void;
}

function parseDate(raw: string): Date {
  const asNum = Number(raw);
  if (!isNaN(asNum) && asNum > 1e10) return new Date(asNum);
  return new Date(raw);
}

export function TransactionRow({ transaction, vendors, categories, isDirty, onUpdate, onApprove }: Props) {
  const cat = transaction.categorization;
  const status: CategorizationStatus = (cat?.status as CategorizationStatus) ?? "NEEDS_REVIEW";

  const [editingReason, setEditingReason] = useState(false);
  const [reason, setReason] = useState(cat?.reason ?? "");

  function commitReason() {
    setEditingReason(false);
    if (reason !== (cat?.reason ?? "")) onUpdate(transaction.id, { reason });
  }

  const isCredit = transaction.amount > 0;
  const amountFmt = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(Math.abs(transaction.amount));
  const parsed = parseDate(transaction.transactionDate);
  const dateFmt = isNaN(parsed.getTime()) ? "—" : parsed.toLocaleDateString("en-US", { month: "short", day: "numeric" });

  const hasCategory = !!cat?.category;
  const approveDisabled = (!isDirty && status === "REVIEWED") || !hasCategory;
  const needsInfoDisabled = status === "NEEDS_MORE_INFO";

  return (
    <tr className={`border-b border-gray-100 transition-colors ${isDirty ? "bg-amber-50 hover:bg-amber-100/60" : "hover:bg-gray-50"}`}>
      <td className="w-1 p-0">{isDirty && <div className="w-1 h-full min-h-[52px] bg-amber-400 rounded-r" />}</td>
      <td className="px-4 py-3 text-xs text-gray-400 w-20 whitespace-nowrap">{dateFmt}</td>
      <td className="px-4 py-3 text-sm text-gray-800 max-w-[240px]">
        <span className="truncate block" title={transaction.details}>{transaction.details}</span>
        {cat?.aiGenerated && <span className="text-xs text-indigo-400 font-medium">AI</span>}
      </td>
      <td className={`px-4 py-3 text-sm font-medium tabular-nums w-28 text-right ${isCredit ? "text-green-600" : "text-gray-800"}`}>
        {isCredit ? "+" : "-"}{amountFmt}
      </td>
      <td className="px-4 py-3 w-36">
        <StatusBadge status={status} />
        {cat?.confidenceScore != null && <span className="block text-xs text-gray-400 mt-0.5">{cat.confidenceScore}%</span>}
      </td>
      <td className="px-4 py-3 min-w-[180px]">
        <select value={cat?.payee?.id ?? ""} onChange={(e) => onUpdate(transaction.id, { payeeId: e.target.value || null })}
          className="w-full text-sm border border-gray-200 rounded-md px-2 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent">
          <option value="">— No payee —</option>
          {vendors.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
        </select>
      </td>
      <td className="px-4 py-3 min-w-[180px]">
        <select value={cat?.category?.id ?? ""} onChange={(e) => onUpdate(transaction.id, { categoryId: e.target.value || null })}
          className="w-full text-sm border border-gray-200 rounded-md px-2 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent">
          <option value="">— No category —</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </td>
      <td className="px-4 py-3 min-w-[200px]">
        {editingReason ? (
          <input autoFocus type="text" value={reason} onChange={(e) => setReason(e.target.value)}
            onBlur={commitReason} onKeyDown={(e) => e.key === "Enter" && commitReason()} placeholder="Add a reason..."
            className="w-full text-sm border border-indigo-400 rounded-md px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-400" />
        ) : (
          <button onClick={() => setEditingReason(true)}
            className="w-full text-left text-sm text-gray-600 hover:text-gray-900 px-2 py-1.5 rounded-md hover:bg-black/5 transition-colors" title={reason || undefined}>
            {reason ? <span className="block truncate">{reason}</span> : <span className="text-gray-300 italic">Add reason...</span>}
          </button>
        )}
      </td>
      <td className="px-4 py-3 w-48">
        <div className="flex gap-2">
          <button onClick={() => onApprove(transaction.id)}
            disabled={approveDisabled}
            title={!hasCategory ? "Select a category before approving" : undefined}
            className={`flex-1 px-2.5 py-1.5 rounded-md text-xs font-semibold border transition-all ${
              !hasCategory ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
              : isDirty ? "bg-green-500 text-white border-green-500 shadow-md shadow-green-200 ring-2 ring-green-400 ring-offset-1 hover:bg-green-600"
              : status === "REVIEWED" ? "bg-green-50 text-green-700 border-green-200 opacity-40 cursor-not-allowed"
              : "bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
            }`}>
            {isDirty ? "Save & Approve" : "Approve"}
          </button>
          <button onClick={() => onUpdate(transaction.id, { status: "NEEDS_MORE_INFO" })}
            disabled={needsInfoDisabled}
            className="flex-1 px-2.5 py-1.5 rounded-md text-xs font-medium bg-orange-50 text-orange-700 border border-orange-200 hover:bg-orange-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
            Needs Info
          </button>
        </div>
      </td>
    </tr>
  );
}
