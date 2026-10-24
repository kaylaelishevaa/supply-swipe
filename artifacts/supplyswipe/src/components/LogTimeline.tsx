// Activity log timeline. Dot colours: amber human · purple agent · teal approval · ink rule check.

import type { LogKind, LogRow } from "@/lib/types";

export const LOG_COLORS: Record<LogKind, string> = {
  human: "#E9A23B",
  agent: "#6A5CF0",
  approval: "#0E8A76",
  rule: "#1D1B2E",
};

export function LogLegend() {
  const items: [LogKind, string][] = [
    ["human", "Human"],
    ["agent", "Agent"],
    ["approval", "Approval"],
    ["rule", "Rule check"],
  ];
  return (
    <div className="flex gap-3 text-[11px] text-muted">
      {items.map(([k, label]) => (
        <span key={k} className="flex items-center gap-[5px]">
          <span className="h-2 w-2 rounded-full" style={{ background: LOG_COLORS[k] }} />
          {label}
        </span>
      ))}
    </div>
  );
}

export function LogTimeline({ rows }: { rows: LogRow[] }) {
  return (
    <>
      {rows.map((r, i) => (
        <div
          key={r.id}
          className="grid grid-cols-[14px_1fr_auto] gap-2.5 py-2.5"
          style={{ borderBottom: `1px solid ${i === rows.length - 1 ? "transparent" : "#E4E2EF"}` }}
        >
          <div className="flex flex-col items-center pt-1">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: LOG_COLORS[r.kind] }} />
          </div>
          <div className="min-w-0">
            <div className="text-[13px] font-semibold">{r.action}</div>
            <div className="mt-0.5 text-[11px] text-ink">{r.actor}</div>
            <div className="mt-0.5 text-[11px] text-muted">{r.reason}</div>
          </div>
          <div className="text-[11px] text-muted">{r.at}</div>
        </div>
      ))}
    </>
  );
}
