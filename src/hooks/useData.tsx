"use client";

import React, { createContext, useContext } from "react";

export type DataContextValue = Record<string, any>;

const DataContext = createContext<DataContextValue | null>(null);

export function useData<T extends DataContextValue = DataContextValue>() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData harus dipakai di dalam <DataProvider>");
  return ctx as T;
}

export function DataProvider({
  children,
  ...values
}: {
  children: React.ReactNode;
  [key: string]: any;
}) {
  return <DataContext.Provider value={values}>{children}</DataContext.Provider>;
}
