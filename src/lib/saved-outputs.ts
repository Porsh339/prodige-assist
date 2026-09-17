import { useCallback, useEffect, useState } from "react";

import type { OutputKind, SavedOutput } from "./types";

const KEY = "meridian.saved-outputs.v1";
const LIMIT = 50;

function read(): SavedOutput[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed = raw ? (JSON.parse(raw) as SavedOutput[]) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function write(items: SavedOutput[]) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(items.slice(0, LIMIT)));
  } catch {
    // storage full or unavailable — outputs simply won't persist
  }
  window.dispatchEvent(new Event("meridian:outputs"));
}

export function saveOutput(entry: Omit<SavedOutput, "id" | "createdAt">) {
  const item: SavedOutput = {
    ...entry,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: Date.now(),
  };
  write([item, ...read()]);
  return item;
}

/** Reads saved outputs after hydration so SSR and client markup match. */
export function useSavedOutputs(kind?: OutputKind) {
  const [items, setItems] = useState<SavedOutput[]>([]);

  const refresh = useCallback(() => {
    const all = read();
    setItems(kind ? all.filter((i) => i.kind === kind) : all);
  }, [kind]);

  useEffect(() => {
    refresh();
    window.addEventListener("meridian:outputs", refresh);
    return () => window.removeEventListener("meridian:outputs", refresh);
  }, [refresh]);

  const remove = useCallback((id: string) => {
    write(read().filter((i) => i.id !== id));
  }, []);

  const clear = useCallback(() => write([]), []);

  return { items, remove, clear, refresh };
}

export function relativeTime(ts: number) {
  const diff = Math.max(0, Date.now() - ts);
  const m = Math.round(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.round(h / 24)}d ago`;
}
