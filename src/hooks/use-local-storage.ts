"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Like useState, but persisted to localStorage under `key`.
 *
 * To stay hydration-safe, the first render (server and client) always uses
 * `initialValue`; the stored value is read on mount and applied after, so it
 * never causes a server/client markup mismatch.
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(initialValue);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw !== null) {
        setValue(JSON.parse(raw) as T);
      }
    } catch {
      // Ignore corrupt/unavailable storage and keep the default.
    }
    setLoaded(true);
  }, [key]);

  useEffect(() => {
    if (!loaded) {
      return;
    }
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Ignore quota/availability errors.
    }
  }, [key, value, loaded]);

  const reset = useCallback(() => {
    try {
      window.localStorage.removeItem(key);
    } catch {
      // Ignore.
    }
    setValue(initialValue);
  }, [key, initialValue]);

  return [value, setValue, reset] as const;
}
