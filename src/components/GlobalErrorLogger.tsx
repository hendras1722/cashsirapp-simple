"use client";

import { useEffect } from "react";

export default function GlobalErrorLogger() {
  useEffect(() => {
    window.onerror = function (message, source, lineno, colno, error) {
      const parsed = parseStack(error?.stack || "");
      sendLog("error", "window.onerror", {
        message: String(message),
        source,
        lineno,
        colno,
        ...parsed,
      });
      return false;
    };

    window.onunhandledrejection = function (event) {
      const err    = event.reason;
      const parsed = parseStack(err?.stack || "");
      sendLog("error", "unhandledrejection", {
        message: String(err?.message || err),
        ...parsed,
      });
    };

    const originalConsoleError = console.error;
    console.error              = (...args) => {
      originalConsoleError(...args);
      sendLog("error", "console.error", { message: args.map(String).join(" ") });
    };

    return () => {
      console.error = originalConsoleError;
    };
  }, []);

  function parseStack(stack: string) {
    if (!stack) return {};
    const match = stack.match(/(https?:\/\/[^\s)]+):(\d+):(\d+)/);
    if (match) {
      return {
        file: match[1],
        line: match[2],
        column: match[3],
      };
    }
    return {};
  }

  function sendLog(level: string, context: string, error: any) {
    fetch("/api/log-error", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ level, context, error }),
    }).catch(() => {});
  }

  return null;
}
