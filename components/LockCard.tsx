// Sealed-limit card: purple-soft with a lock. Only ever rendered on the limit owner's own screens.

import type { ReactNode } from "react";
import { LockIcon } from "./Icons";

export function LockCard({
  label,
  value,
  unit = " /kg",
  note,
  className = "",
}: {
  label: string;
  value: string;
  unit?: string;
  note?: ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-[12px] bg-purple-soft px-3 py-2.5 ${className}`}>
      <div className="flex items-center gap-1 text-[11px] font-semibold text-purple-text">
        <LockIcon />
        {label}
      </div>
      <div className="mt-0.5 text-[17px] font-semibold text-purple-text">
        {value}
        <span className="text-[11px] font-normal">{unit}</span>
      </div>
      {note && <div className="text-[10px] text-purple-text">{note}</div>}
    </div>
  );
}

/** The one-line reminder under a sealed limit. */
export function SealedNote({ who = "supplier" }: { who?: "supplier" | "buyer" }) {
  return <div className="text-[11px] text-purple-text">Only your Wakil sees this. It never reaches the {who}.</div>;
}
