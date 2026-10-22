"use client";
// Price per kg by round (Recharts): buyer and supplier lines, the agreement band (no numeric ends),
// a dashed market line and the deal dot. Draws one point per message as the replay advances.
// No tooltip, so nothing extra can leak.

import { CartesianGrid, ComposedChart, Line, ReferenceArea, ReferenceDot, ReferenceLine, XAxis, YAxis } from "recharts";
import type { NegMessage, NegotiationView } from "@/lib/types";

export function ConvergenceChart({
  view,
  visible,
  dealFound,
  width = 334,
  height = 108,
}: {
  view: NegotiationView;
  visible: NegMessage[];
  dealFound: boolean;
  width?: number;
  height?: number;
}) {
  // Round r = the r-th priced message from each side.
  const rounds: { round: number; buyer?: number; supplier?: number }[] = [1, 2, 3].map((round) => ({ round }));
  (["buyer", "supplier"] as const).forEach((side) => {
    visible.filter((m) => m.side === side && m.pricePerKg != null).forEach((m, i) => {
      if (rounds[i]) rounds[i][side] = m.pricePerKg;
    });
  });
  const deal = visible.find((m) => m.type === "accept")?.pricePerKg;
  // The accept closes round 3 for both sides at the deal price.
  if (deal != null) rounds[2] = { round: 3, buyer: deal, supplier: deal };
  const big = height > 150;
  const fs = big ? 10 : 9;

  return (
    <ComposedChart width={width} height={height} data={rounds} margin={{ top: 6, right: big ? 8 : 6, bottom: 0, left: 0 }}>
      <ReferenceArea y1={view.band.lo} y2={view.band.hi} fill="#D7F3EC" fillOpacity={0.7} ifOverflow="extendDomain" />
      <CartesianGrid horizontal vertical={false} stroke="#E4E2EF" />
      <XAxis
        dataKey="round"
        type="number"
        domain={[0.75, 3.25]}
        ticks={[1, 2, 3]}
        tickFormatter={(r) => `round ${r}`}
        tick={{ fontSize: fs, fill: "#6E6C86" }}
        axisLine={false}
        tickLine={false}
        height={big ? 20 : 16}
      />
      <YAxis
        domain={[view.scale.lo, view.scale.hi]}
        ticks={big ? [12.0, 12.4, 12.8] : [12.0, 12.8]}
        tickFormatter={(v: number) => v.toFixed(2)}
        tick={{ fontSize: fs, fill: "#6E6C86" }}
        axisLine={false}
        tickLine={false}
        width={big ? 34 : 30}
      />
      <ReferenceLine
        y={view.marketPerKg}
        stroke="#6E6C86"
        strokeDasharray={big ? "4 4" : "3 3"}
        label={big ? { value: `market ${view.marketPerKg.toFixed(2)}`, position: "insideBottomRight", fontSize: 10, fill: "#6E6C86" } : undefined}
      />
      <Line dataKey="supplier" stroke="#0E8A76" strokeWidth={big ? 2.5 : 2} dot={{ r: big ? 4.5 : 3, fill: "#0E8A76", stroke: "none" }} isAnimationActive={false} connectNulls />
      <Line dataKey="buyer" stroke="#6A5CF0" strokeWidth={big ? 2.5 : 2} dot={{ r: big ? 4.5 : 3, fill: "#6A5CF0", stroke: "none" }} isAnimationActive={false} connectNulls />
      {dealFound && deal != null && (
        <ReferenceDot
          x={3}
          y={deal}
          r={big ? 7 : 5}
          fill="#fff"
          stroke="#1D1B2E"
          strokeWidth={big ? 2.5 : 2}
          label={big ? { value: `deal RM${deal.toFixed(2)}`, position: "left", offset: 12, fontSize: 12, fontWeight: 600, fill: "#1D1B2E" } : undefined}
        />
      )}
    </ComposedChart>
  );
}
