"use client";

import { useSyncExternalStore, useCallback } from "react";
import { usePagePath } from "./pageProvider";
import { getPageConfig, subscribe } from "./definePage";

export function usePage() {
  const pathname = usePagePath();

  const subscribeToStore = useCallback((callback: () => void) => {
    return subscribe(callback);
  }, []);

  const getSnapshot = useCallback(() => {
    const config = getPageConfig(pathname);
    return JSON.stringify(config);
  }, [pathname]);

  const getServerSnapshot = useCallback(() => {
    return JSON.stringify(undefined);
  }, []);

  const configStr = useSyncExternalStore(
    subscribeToStore,
    getSnapshot,
    getServerSnapshot
  );

  const config = configStr ? JSON.parse(configStr) : undefined;

  return {
    layout: config?.layout ?? true,
    permission: config?.permission ?? [],
    ...config,
  };
}
