// One Wakil message in the S3 chat. Buyer bubbles sit left (purple-soft), supplier bubbles right (white).
// Signed by a named Wakil with a MONO type label, the price in the side colour, the text, then "Why:".

import type { NegMessage } from "@/lib/types";

export function OfferBubble({ m, who, pop = true }: { m: NegMessage; who: string; pop?: boolean }) {
  const b = m.side === "buyer";
  return (
    <div className="flex flex-col gap-[3px]" style={{ alignItems: b ? "flex-start" : "flex-end" }}>
      <div className="flex items-center gap-1.5 px-1.5 text-[10px] text-muted">
        <span className="whitespace-nowrap font-semibold text-ink">{who}</span>
        <span className="font-mono font-semibold tracking-[0.06em]" style={{ color: b ? "#6A5CF0" : "#0E8A76" }}>
          {m.type === "walk_away" ? "WALK AWAY" : m.type.toUpperCase()}
        </span>
      </div>
      <div
        className="max-w-[84%] px-3 pb-[7px] pt-[9px] text-[13px] leading-[1.45]"
        style={{
          borderRadius: b ? "6px 20px 20px 20px" : "20px 6px 20px 20px",
          background: b ? "#E6E3FF" : "#FFFFFF",
          boxShadow: b ? "none" : "0 4px 12px rgba(60,55,120,0.08)",
          transform: `scale(${pop ? 1 : 0.9})`,
          opacity: pop ? 1 : 0,
          transformOrigin: b ? "15% 0" : "85% 0",
          transition: "transform .35s cubic-bezier(.2,1.4,.4,1), opacity .25s",
        }}
      >
        {m.pricePerKg != null && (
          <div className="text-[17px] font-extrabold tracking-[-0.01em]" style={{ color: b ? "#4A3DD6" : "#0B7563" }}>
            {m.headline}
          </div>
        )}
        <div className="text-pretty">{m.text}</div>
        <div className="mt-1 flex justify-between gap-2.5 text-[10px] text-muted">
          <span>Why: {m.why}</span>
          <span className="whitespace-nowrap">{m.at}</span>
        </div>
      </div>
    </div>
  );
}
