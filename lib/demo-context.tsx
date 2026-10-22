"use client";
// Global demo context: which side (buyer | supplier) and role (owner | staff) the viewer is.
// There is no real auth. The role switcher in the UI just changes these values.

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Role, Side } from "./types";

interface DemoState {
  side: Side;
  role: Role;
  setSide: (s: Side) => void;
  setRole: (r: Role) => void;
}

const DemoContext = createContext<DemoState | null>(null);
const KEY = "supplyswipe.demo";

export function DemoProvider({ children }: { children: ReactNode }) {
  const [side, setSide] = useState<Side>("buyer");
  const [role, setRole] = useState<Role>("owner");

  // Restore after mount so server and client render the same first frame.
  useEffect(() => {
    try {
      const v = JSON.parse(localStorage.getItem(KEY) || "{}");
      if (v.side === "buyer" || v.side === "supplier") setSide(v.side);
      if (v.role === "owner" || v.role === "staff") setRole(v.role);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify({ side, role }));
    } catch {
      // ignore
    }
  }, [side, role]);

  return <DemoContext.Provider value={{ side, role, setSide, setRole }}>{children}</DemoContext.Provider>;
}

export function useDemo() {
  const ctx = useContext(DemoContext);
  if (!ctx) throw new Error("useDemo must be used inside DemoProvider");
  return ctx;
}
