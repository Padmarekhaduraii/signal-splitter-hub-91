import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { AnalysisResult } from "./types";

const STORAGE_KEY = "signal-splitter:source-analysis";

interface SourceStore {
  result: AnalysisResult | null;
  setResult: (result: AnalysisResult) => void;
  clear: () => void;
}

const Ctx = createContext<SourceStore | null>(null);

export function SourceProvider({ children }: { children: ReactNode }) {
  const [result, setResultState] = useState<AnalysisResult | null>(null);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setResultState(JSON.parse(raw) as AnalysisResult);
    } catch {
      /* ignore unreadable storage */
    }
  }, []);

  const setResult = useCallback((next: AnalysisResult) => {
    setResultState(next);
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { /* ignore */ }
  }, []);

  const clear = useCallback(() => {
    setResultState(null);
    try { window.localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
  }, []);

  const value = useMemo(() => ({ result, setResult, clear }), [result, setResult, clear]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

/** Shared source + Fact Bank for Content Generation and Fact Lock. */
export function useSource(): SourceStore {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useSource must be used inside SourceProvider");
  return ctx;
}
