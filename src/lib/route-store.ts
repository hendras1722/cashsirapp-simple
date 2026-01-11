"use client";

import { useSyncExternalStore } from "react";

type RouteData = Record<string, any>;

let currentRoute: RouteData = {};
const listeners             = new Set<() => void>();

function setRoute(data: RouteData) {
  currentRoute = { ...currentRoute, ...data };
  listeners.forEach((fn) => fn());
}

function subscribe(callback: () => void) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

// ✅ tambahkan getServerSnapshot
export function useRoute() {
  return useSyncExternalStore(
    subscribe,
    () => currentRoute, // client snapshot
    () => currentRoute // server snapshot
  );
}

export function setRouteData(data: RouteData) {
  setRoute(data);
}
