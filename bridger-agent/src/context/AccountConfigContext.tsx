"use client";

import { createContext, useContext, useState } from "react";
import { MOCK_BANK_ACCOUNTS } from "@/lib/mock-data";

const DEFAULT_CONFIGS: Record<string, string> = Object.fromEntries(
  MOCK_BANK_ACCOUNTS.map((a) => [a.id, JSON.stringify({ fiscalYearStart: "01-01", autoCategorizeThreshold: 0.85 }, null, 2)])
);

interface AccountConfigContextValue {
  configs: Record<string, string>;
  saveConfig: (bankAccountId: string, config: string) => void;
}

const AccountConfigContext = createContext<AccountConfigContextValue | null>(null);

export function AccountConfigProvider({ children }: { children: React.ReactNode }) {
  const [configs, setConfigs] = useState<Record<string, string>>(DEFAULT_CONFIGS);

  function saveConfig(bankAccountId: string, config: string) {
    setConfigs((prev) => ({ ...prev, [bankAccountId]: config }));
  }

  return (
    <AccountConfigContext.Provider value={{ configs, saveConfig }}>
      {children}
    </AccountConfigContext.Provider>
  );
}

export function useAccountConfigs() {
  const ctx = useContext(AccountConfigContext);
  if (!ctx) throw new Error("useAccountConfigs must be used inside AccountConfigProvider");
  return ctx;
}
