"use client";
// Small data hook: runs an api.ts read, and runs it again whenever the store changes
// (after any approve, log, save, ...). Returns undefined until the first result arrives.

import { useEffect, useState } from "react";
import { subscribe } from "./api";

export function useApi<T>(read: () => Promise<T>, deps: unknown[] = []): T | undefined {
  const [data, setData] = useState<T>();
  useEffect(() => {
    let alive = true;
    const run = () => read().then((v) => alive && setData(v));
    run();
    const off = subscribe(run);
    return () => {
      alive = false;
      off();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return data;
}
