"use client";

import { useEffect, useRef } from "react";
import { usePagePath } from "./pageProvider";

export type PageConfig = {
  layout?: boolean;
  permission?: string[];
  [key: string]: any;
};

const pageConfigRegistry =
  typeof window !== "undefined"
    ? new Map<string, PageConfig>()
    : new Map<string, PageConfig>();

const listeners = new Set<() => void>();

function notifyListeners() {
  listeners.forEach((listener) => listener());
}

export function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getPageConfig(path: string): PageConfig | undefined {
  return pageConfigRegistry.get(path);
}

export function definePage(path: string, config: PageConfig) {
  if (typeof window !== "undefined") {
    console.log("[definePage] Registering config for:", path, config);
    pageConfigRegistry.set(path, config);
    notifyListeners();
  }
}

export function useDefinePage(config: PageConfig) {
  const pathname   = usePagePath();
  const isFirstRun = useRef(true);

  if (isFirstRun.current && pathname && typeof window !== "undefined") {
    console.log("[useDefinePage] IMMEDIATE register for:", pathname, config);
    pageConfigRegistry.set(pathname, config);
    notifyListeners();
    isFirstRun.current = false;
  }

  useEffect(() => {
    if (!pathname) return;

    const current = pageConfigRegistry.get(pathname);

    if (JSON.stringify(current) !== JSON.stringify(config)) {
      console.log("[useDefinePage] Updating config for:", pathname, config);
      pageConfigRegistry.set(pathname, config);
      notifyListeners();
    }

    return () => {
      console.log("[useDefinePage] Cleaning config for:", pathname);
      pageConfigRegistry.delete(pathname);
      notifyListeners();
    };
  }, [pathname, config]);
}
