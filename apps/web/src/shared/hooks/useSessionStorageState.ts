import { useEffect, useState } from "react";
import type { Dispatch, SetStateAction } from "react";

export function useSessionStorageState<T>(
  key: string,
  initialValue: T,
): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === "undefined") return initialValue;
    try {
      const stored = window.sessionStorage.getItem(key);
      return stored ? (JSON.parse(stored) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.sessionStorage.setItem(key, JSON.stringify(value));
    } catch {
      // sessionStorage unavailable (e.g. private browsing) — state stays in-memory only
    }
  }, [key, value]);

  return [value, setValue];
}
