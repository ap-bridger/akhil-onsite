"use client";

import type { BankAccount } from "@/types";

interface SidebarProps {
  bankAccounts: BankAccount[];
  activeBankAccountId: string;
  onSelectBankAccount: (id: string) => void;
}

export function Sidebar({ bankAccounts, activeBankAccountId, onSelectBankAccount }: SidebarProps) {
  return (
    <aside className="w-60 shrink-0 bg-white border-r border-gray-200 flex flex-col h-screen sticky top-0">
      <div className="px-5 py-4 border-b border-gray-200">
        <span className="text-lg font-semibold tracking-tight text-gray-900">Bridger</span>
        <p className="text-xs text-gray-400 mt-0.5">Mogee Tea LLC</p>
      </div>

      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        <p className="px-2 pt-1 pb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Bank Accounts
        </p>
        {bankAccounts.map((account) => (
          <button
            key={account.id}
            onClick={() => onSelectBankAccount(account.id)}
            className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors ${
              account.id === activeBankAccountId
                ? "bg-indigo-50 text-indigo-700 font-medium"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }`}
          >
            <span className="block truncate">{account.name}</span>
            <span className="block text-xs text-gray-400 font-mono truncate mt-0.5">
              {account.accountNumber}
            </span>
          </button>
        ))}
      </nav>

      <div className="px-5 py-3 border-t border-gray-200">
        <p className="text-xs text-gray-400">Mogee Tea LLC</p>
      </div>
    </aside>
  );
}
