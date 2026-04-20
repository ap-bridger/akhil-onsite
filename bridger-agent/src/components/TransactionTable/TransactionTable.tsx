import type { Category, CategorizationStatus, Transaction, Vendor } from "@/types";
import { TransactionRow } from "@/components/TransactionRow/TransactionRow";

interface Props {
  transactions: Transaction[];
  vendors: Vendor[];
  categories: Category[];
  dirtyIds: Set<string>;
  onUpdate: (id: string, patch: Partial<{ reason: string; payeeId: string | null; categoryId: string | null; status: CategorizationStatus }>) => void;
  onApprove: (id: string) => void;
}

export function TransactionTable({ transactions, vendors, categories, dirtyIds, onUpdate, onApprove }: Props) {
  if (transactions.length === 0) {
    return <div className="flex flex-col items-center justify-center py-24 text-gray-400"><p className="text-sm">No transactions found</p></div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b-2 border-gray-200 bg-gray-50">
            <th className="w-1 p-0" />
            <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
            <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Details</th>
            <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Amount</th>
            <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Payee</th>
            <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
            <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Reason</th>
            <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx) => (
            <TransactionRow key={tx.id} transaction={tx} vendors={vendors} categories={categories}
              isDirty={dirtyIds.has(tx.id)} onUpdate={onUpdate} onApprove={onApprove} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
