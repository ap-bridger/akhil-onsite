"use client";

import { createContext, useContext, useState } from "react";

interface AccountConfigContextValue {
  configs: Record<string, string>;
  saveConfig: (bankAccountId: string, config: string) => void;
}

const AccountConfigContext = createContext<AccountConfigContextValue | null>(null);

export function AccountConfigProvider({ children }: { children: React.ReactNode }) {
  const [configs, setConfigs] = useState<Record<string, string>>({});

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
