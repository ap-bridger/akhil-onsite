"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useQuery, useMutation } from "@apollo/client";
import { GET_BANK_ACCOUNTS, GET_CLIENT_CONFIGS } from "@/client/graphql/queries";
import { UPDATE_CLIENT_CONFIG } from "@/client/graphql/mutations";
import type { BankAccount } from "@/types";

interface CardState { value: string; saved: boolean; error: string | null }

const DEFAULT_CONFIG = "Classify revenue deposits from Square as \"Revenue\".\nClassify rent payments to Kwan Family Trust as \"Rent\".\nClassify Gusto payroll debits as \"Payroll\".";

export default function ConfigPage() {
  const { data: baData, loading: baLoading } = useQuery<{ bankAccounts: BankAccount[] }>(GET_BANK_ACCOUNTS);
  const bankAccounts = baData?.bankAccounts ?? [];

  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const effectiveAccountId = selectedAccountId ?? bankAccounts[0]?.id ?? null;

  const { data: configData, loading: configLoading, refetch: refetchConfig } = useQuery<{
    clientConfigs: { id: string; config: string; bankAccountId: string }[];
  }>(GET_CLIENT_CONFIGS, {
    variables: { bankAccountId: effectiveAccountId },
    skip: !effectiveAccountId,
  });

  const [updateConfig] = useMutation(UPDATE_CLIENT_CONFIG);

  const [cardStates, setCardStates] = useState<Record<string, CardState>>({});

  useEffect(() => {
    if (!bankAccounts.length) return;
    setCardStates((prev) => {
      const next = { ...prev };
      for (const acct of bankAccounts) {
        if (!next[acct.id]) {
          next[acct.id] = { value: DEFAULT_CONFIG, saved: false, error: null };
        }
      }
      return next;
    });
  }, [bankAccounts]);

  useEffect(() => {
    if (!configData?.clientConfigs?.length || !effectiveAccountId) return;
    const serverConfig = configData.clientConfigs[0]?.config;
    if (serverConfig) {
      setCardStates((prev) => ({
        ...prev,
        [effectiveAccountId]: {
          value: serverConfig,
          saved: false,
          error: null,
        },
      }));
    }
  }, [configData, effectiveAccountId]);

  const serverConfigValue = configData?.clientConfigs?.[0]?.config ?? DEFAULT_CONFIG;

  async function handleSave(id: string) {
    const raw = cardStates[id]?.value?.trim();
    if (!raw) {
      setCardStates((p) => ({ ...p, [id]: { ...p[id], error: "Rules cannot be empty" } }));
      return;
    }
    try {
      await updateConfig({ variables: { bankAccountId: id, config: raw } });
      setCardStates((p) => ({ ...p, [id]: { ...p[id], saved: true, error: null } }));
      setTimeout(() => setCardStates((p) => ({ ...p, [id]: { ...p[id], saved: false } })), 2000);
      refetchConfig();
    } catch (err) {
      setCardStates((p) => ({ ...p, [id]: { ...p[id], error: String(err) } }));
    }
  }

  if (baLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <Link href="/transactions" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            Transactions
          </Link>
          <span className="text-gray-300">/</span>
          <h1 className="text-base font-semibold text-gray-900">Accounting Rules</h1>
        </div>
        <p className="text-xs text-gray-400">Mogee Tea LLC</p>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        <p className="text-sm text-gray-500">Write plain-language accounting rules for each bank account. These rules are passed to the AI when categorizing transactions.</p>

        {bankAccounts.map((account) => {
          const state = cardStates[account.id] ?? { value: DEFAULT_CONFIG, saved: false, error: null };
          const isDirty = state.value !== serverConfigValue;

          return (
            <div key={account.id} className={`bg-white rounded-xl border transition-colors ${state.error ? "border-red-300" : isDirty ? "border-amber-300" : "border-gray-200"}`}>
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-gray-900">{account.name}</h2>
                  <p className="text-xs text-gray-400 font-mono mt-0.5">{account.accountNumber}</p>
                </div>
                <div className="flex items-center gap-2">
                  {isDirty && !state.error && <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700"><span className="w-1.5 h-1.5 rounded-full bg-amber-400" />Unsaved</span>}
                  {state.saved && <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">Saved</span>}
                </div>
              </div>
              <div className="p-5 space-y-3">
                {configLoading && account.id === effectiveAccountId ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="w-5 h-5 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                  </div>
                ) : (
                  <>
                    <textarea value={state.value} onChange={(e) => {
                      setCardStates((p) => ({ ...p, [account.id]: { ...p[account.id], value: e.target.value, saved: false, error: null } }));
                      if (account.id !== effectiveAccountId) setSelectedAccountId(account.id);
                    }}
                      rows={8} placeholder="Write accounting rules here, e.g.&#10;Classify rent payments to Kwan Family Trust as &quot;Rent&quot;.&#10;Classify Gusto payroll debits as &quot;Payroll&quot;."
                      className={`w-full text-sm rounded-lg p-3 resize-y focus:outline-none focus:ring-2 focus:border-transparent leading-relaxed ${state.error ? "bg-red-50 border border-red-300 text-red-800 focus:ring-red-400" : "bg-gray-50 border border-gray-200 text-gray-800 focus:ring-indigo-400"}`} />
                    {state.error && <p className="text-xs text-red-600">{state.error}</p>}
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => setCardStates((p) => ({ ...p, [account.id]: { value: serverConfigValue, saved: false, error: null } }))} disabled={!isDirty}
                        className="px-3 py-1.5 rounded-lg text-sm text-gray-500 border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">Reset</button>
                      <button onClick={() => handleSave(account.id)} disabled={!isDirty}
                        className={`px-4 py-1.5 rounded-lg text-sm font-medium border transition-colors ${state.saved ? "bg-green-600 text-white border-green-600" : isDirty ? "bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700" : "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"}`}>
                        {state.saved ? "Saved!" : "Save"}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </main>
    </div>
  );
}
