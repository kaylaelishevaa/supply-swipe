// Root of every mobile screen: fills the phone frame, one column, tabular numbers.

import type { ReactNode } from "react";

export function Screen({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`relative flex h-full w-full flex-col overflow-hidden bg-bg text-ink tabular-nums ${className}`}>
      {children}
    </div>
  );
}
