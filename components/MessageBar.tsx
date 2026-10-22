// 10-segment message counter: purple = buyer message, teal = supplier message, line = unused.

import type { NegMessage } from "@/lib/types";

export function MessageBar({ visible, max = 10, height = 5 }: { visible: NegMessage[]; max?: number; height?: number }) {
  return (
    <div className="grid gap-[3px]" style={{ gridTemplateColumns: `repeat(${max}, 1fr)` }}>
      {Array.from({ length: max }, (_, i) => {
        const m = visible[i];
        const bg = m ? (m.side === "buyer" ? "#6A5CF0" : "#0E8A76") : "#E4E2EF";
        return <span key={i} className="rounded-[3px] transition-colors duration-300" style={{ height, background: bg }} />;
      })}
    </div>
  );
}
