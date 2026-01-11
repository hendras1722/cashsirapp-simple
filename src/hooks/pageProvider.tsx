"use client";

import { createContext, useContext } from "react";

const PageContext = createContext<string | undefined>(undefined);

export function ProviderPage({
  value,
  children,
}: {
  value: string;
  children: React.ReactNode;
}) {
  return <PageContext.Provider value={value}>{children}</PageContext.Provider>;
}

export function usePagePath() {
  const ctx = useContext(PageContext);
  if (!ctx) throw new Error("usePagePath must be used inside <ProviderPage>");
  return ctx;
}
