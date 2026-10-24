"use client";
// Global demo context: which side (buyer | supplier) and role (owner | staff) the viewer is.
// There is no real auth. The role switcher in the UI just changes these values.

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
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
  // Latest values, so setSide then setRole in the same tap both persist correctly.
  const cur = useRef<{ side: Side; role: Role }>({ side: "buyer", role: "owner" });

  // Restore after mount so server and client render the same first frame.
  useEffect(() => {
    try {
      const v = JSON.parse(localStorage.getItem(KEY) || "{}");
      if (v.side === "buyer" || v.side === "supplier") {
        setSide(v.side);
        cur.current.side = v.side;
      }
      if (v.role === "owner" || v.role === "staff") {
        setRole(v.role);
        cur.current.role = v.role;
      }
    } catch {
      // ignore
    }
  }, []);

  // Persist on change only (never from an effect), so the defaults can't overwrite saved values.
  const persist = () => {
    try {
      localStorage.setItem(KEY, JSON.stringify(cur.current));
    } catch {
      // ignore
    }
  };
  const changeSide = (s: Side) => {
    cur.current.side = s;
    setSide(s);
    persist();
  };
  const changeRole = (r: Role) => {
    cur.current.role = r;
    setRole(r);
    persist();
  };

  return <DemoContext.Provider value={{ side, role, setSide: changeSide, setRole: changeRole }}>{children}</DemoContext.Provider>;
}

export function useDemo() {
  const ctx = useContext(DemoContext);
  if (!ctx) throw new Error("useDemo must be used inside DemoProvider");
  return ctx;
}
