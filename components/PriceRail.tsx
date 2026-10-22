// 1-D price rail between the two agents. The shaded band has NO numeric ends, so no sealed limit
// is ever printed. Shows the public market tick, both sides' current (public) offers, and the deal pill.

import type { NegotiationView } from "@/lib/types";
import { railPct, rm } from "@/lib/negotiation";

const EASE = "cubic-bezier(.2,1.2,.4,1)";

export function PriceRail({
  view,
  buyerPrice,
  supplierPrice,
  dealPrice,
  size = "mobile",
}: {
  view: NegotiationView;
  buyerPrice?: number;
  supplierPrice?: number;
  dealPrice?: number;
  size?: "mobile" | "desktop";
}) {
  const s = view.scale;
  const lo = railPct(view.band.lo, s);
  const width = (parseFloat(railPct(view.band.hi, s)) - parseFloat(lo)).toFixed(2) + "%";
  const met = dealPrice != null;
  const d = size === "desktop";
  const dot = d ? 18 : 16;
  const bLeft = railPct(buyerPrice ?? 12.0, s);
  const sLeft = railPct(supplierPrice ?? 12.8, s);
  const market = railPct(view.marketPerKg, s);
  const trans = `left .7s ${EASE}, opacity .3s`;

  return (
    <div className="relative" style={{ height: d ? 56 : 50, margin: d ? "0 60px" : "0 6px" }}>
      <div className="absolute inset-x-0 h-1 rounded-[2px] bg-neutral" style={{ top: d ? 32 : 30 }} />
      <div className="absolute rounded-[6px] bg-teal-soft" style={{ left: lo, width, top: d ? 27 : 26, height: d ? 14 : 12 }} aria-label="Zone of possible agreement" />
      {d && (
        <div className="absolute text-[10px] text-teal-text" style={{ left: lo, top: 46 }}>
          zone of possible agreement · shown in replay only
        </div>
      )}
      <div className="absolute border-l-[1.5px] border-dashed border-muted" style={{ left: market, top: 22, height: d ? 24 : 20 }} />
      {!d && (
        <div className="absolute -translate-x-1/2 whitespace-nowrap text-[9px] text-muted" style={{ left: market, top: 42 }}>
          market {view.marketPerKg.toFixed(2)}
        </div>
      )}
      {/* Buyer offer */}
      <div
        className="absolute rounded-full border-[3px] border-white bg-purple"
        style={{ left: bLeft, top: d ? 25 : 24, width: dot, height: dot, marginLeft: -dot / 2, boxShadow: "0 2px 6px rgba(90,79,207,0.5)", opacity: buyerPrice != null ? 1 : 0, transition: trans }}
      />
      <div
        className="absolute -translate-x-1/2 whitespace-nowrap font-semibold text-purple-text"
        style={{ left: bLeft, top: d ? 0 : 2, fontSize: d ? 12 : 11, opacity: buyerPrice != null && !met ? 1 : 0, transition: trans }}
      >
        {buyerPrice != null ? rm(buyerPrice) : ""}
      </div>
      {/* Supplier offer */}
      <div
        className="absolute rounded-full border-[3px] border-white bg-teal"
        style={{ left: sLeft, top: d ? 25 : 24, width: dot, height: dot, marginLeft: -dot / 2, boxShadow: "0 2px 6px rgba(14,124,107,0.5)", opacity: supplierPrice != null ? 1 : 0, transition: trans }}
      />
      <div
        className="absolute -translate-x-1/2 whitespace-nowrap font-semibold text-teal-text"
        style={{ left: sLeft, top: d ? 0 : 2, fontSize: d ? 12 : 11, opacity: supplierPrice != null && !met ? 1 : 0, transition: trans }}
      >
        {supplierPrice != null ? rm(supplierPrice) : ""}
      </div>
      {/* Deal pill */}
      <div
        className="absolute top-0 flex -translate-x-1/2 items-center whitespace-nowrap rounded-full bg-ink font-semibold text-white"
        style={{ left: railPct(dealPrice ?? 12.2, s), height: d ? 22 : 20, padding: d ? "0 10px" : "0 8px", fontSize: d ? 12 : 11, opacity: met ? 1 : 0, transition: "opacity .4s" }}
      >
        deal {rm(dealPrice ?? 12.2)}
      </div>
    </div>
  );
}
