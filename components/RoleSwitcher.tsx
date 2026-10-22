"use client";
// Owner / Staff pill. Simulated permissions: it only changes the demo context role.

import { useDemo } from "@/lib/demo-context";

export function RoleSwitcher({ bordered = false }: { bordered?: boolean }) {
  const { role, setRole } = useDemo();
  return (
    <div
      className={`flex rounded-full bg-white p-[3px] text-[12px] font-semibold ${
        bordered ? "border border-line" : "shadow-ctl"
      }`}
      role="radiogroup"
      aria-label="Role"
    >
      {(["owner", "staff"] as const).map((r) => (
        <button
          key={r}
          role="radio"
          aria-checked={role === r}
          onClick={() => setRole(r)}
          className={`rounded-full px-3 py-[5px] ${role === r ? "bg-ink text-white" : "text-muted"}`}
        >
          {r === "owner" ? "Owner" : "Staff"}
        </button>
      ))}
    </div>
  );
}
