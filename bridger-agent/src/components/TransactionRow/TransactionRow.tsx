import type { Transaction } from "@/types";
import type { CategorizationStatus } from "@/types";
import { StatusBadge } from "@/components/StatusBadge/StatusBadge";

export function TransactionRow({ transaction }: { transaction: Transaction }) {
  const cat = transaction.categorization;
  const status: CategorizationStatus = (cat?.status as CategorizationStatus) ?? "NEEDS_REVIEW";
  const isCredit = transaction.amount > 0;
  const amountFmt = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(Math.abs(transaction.amount));
  const dateFmt = new Date(transaction.transactionDate).toLocaleDateString("en-US", { month: "short", day: "numeric" });

  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
      <td className="px-4 py-3 text-xs text-gray-400 w-16">{dateFmt}</td>
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
      <td className="px-4 py-3 text-sm text-gray-700 w-40">{cat?.payee?.name ?? <span className="text-gray-300">—</span>}</td>
      <td className="px-4 py-3 text-sm text-gray-700 w-48">{cat?.category?.name ?? <span className="text-gray-300">—</span>}</td>
      <td className="px-4 py-3 text-sm text-gray-500 min-w-[200px]">
        {cat?.reason ? <span className="block truncate" title={cat.reason}>{cat.reason}</span> : <span className="text-gray-300">—</span>}
      </td>
    </tr>
  );
}
