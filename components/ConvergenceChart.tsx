"use client";
// Price per kg by round (Recharts): buyer and supplier lines, the agreement band (no numeric ends),
// a dashed market line and the deal dot. Draws one point per message as the replay advances.
// No tooltip, so nothing extra can leak.

import { CartesianGrid, ComposedChart, Line, ReferenceArea, ReferenceDot, ReferenceLine, XAxis, YAxis } from "recharts";
import type { NegMessage, NegotiationView } from "@/lib/types";

type LabelProps = { viewBox?: { x?: number; y?: number; width?: number } };

/** Small SVG label placed relative to a reference line or dot (desktop chart only). */
function ChartLabel({ viewBox, dx, dy, text, strong = false }: LabelProps & { dx: number; dy: number; text: string; strong?: boolean }) {
  const x = (viewBox?.x ?? 0) + (viewBox?.width ?? 0) + dx;
  const y = (viewBox?.y ?? 0) + dy;
  return (
    <text x={x} y={y} fontSize={strong ? 12 : 10} fontWeight={strong ? 600 : 400} fill={strong ? "#1D1B2E" : "#6E6C86"}>
      {text}
    </text>
  );
}

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
  // Round r = the r-th priced message from each side; the accept adds a final round where both meet.
  // The number of rounds comes from the whole transcript, so the axis stays put during the replay.
  const offers = (msgs: NegMessage[], side: "buyer" | "supplier") => msgs.filter((m) => m.side === side && m.pricePerKg != null && m.type !== "accept");
  const accepted = view.messages.some((m) => m.type === "accept");
  const total = Math.max(1, offers(view.messages, "buyer").length, offers(view.messages, "supplier").length) + (accepted ? 1 : 0);
  const rounds: { round: number; buyer?: number; supplier?: number }[] = Array.from({ length: total }, (_, i) => ({ round: i + 1 }));
  (["buyer", "supplier"] as const).forEach((side) => {
    offers(visible, side).forEach((m, i) => {
      if (rounds[i]) rounds[i][side] = m.pricePerKg;
    });
  });
  const deal = visible.find((m) => m.type === "accept")?.pricePerKg;
  if (deal != null) rounds[total - 1] = { round: total, buyer: deal, supplier: deal };
  const big = height > 150;
  const fs = big ? 10 : 9;
  const xTicks = rounds.map((r) => r.round).filter((r) => total <= 6 || r % 2 === 1 || r === total);
  const yStep = big ? 0.2 : 0.4;
  const yTicks: number[] = [];
  for (let v = Math.ceil(view.scale.lo / yStep) * yStep; v <= view.scale.hi + 1e-9; v += yStep) yTicks.push(+v.toFixed(2));

  return (
    <ComposedChart width={width} height={height} data={rounds} margin={{ top: 6, right: big ? 8 : 6, bottom: 0, left: 0 }}>
      <ReferenceArea y1={view.band.lo} y2={view.band.hi} fill="#D7F3EC" fillOpacity={0.7} ifOverflow="extendDomain" />
      <CartesianGrid horizontal vertical={false} stroke="#E4E2EF" />
      <XAxis
        dataKey="round"
        type="number"
        domain={[0.75, total + 0.25]}
        ticks={xTicks}
        tickFormatter={(r) => (total > 4 ? `${r}` : `round ${r}`)}
        tick={{ fontSize: fs, fill: "#6E6C86" }}
        axisLine={false}
        tickLine={false}
        height={big ? 20 : 16}
      />
      <YAxis
        domain={[view.scale.lo, view.scale.hi]}
        ticks={yTicks}
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
        label={big ? (p: LabelProps) => <ChartLabel {...p} dx={-150} dy={14} text={`market ${view.marketPerKg.toFixed(2)}`} /> : undefined}
      />
      <Line dataKey="supplier" stroke="#0E8A76" strokeWidth={big ? 2.5 : 2} dot={{ r: big ? 4.5 : 3, fill: "#0E8A76", stroke: "none" }} isAnimationActive={false} connectNulls />
      <Line dataKey="buyer" stroke="#6A5CF0" strokeWidth={big ? 2.5 : 2} dot={{ r: big ? 4.5 : 3, fill: "#6A5CF0", stroke: "none" }} isAnimationActive={false} connectNulls />
      {dealFound && deal != null && (
        <ReferenceDot
          x={total}
          y={deal}
          r={big ? 7 : 5}
          fill="#fff"
          stroke="#1D1B2E"
          strokeWidth={big ? 2.5 : 2}
          label={big ? (p: LabelProps) => <ChartLabel {...p} dx={-86} dy={-12} text={`deal RM${deal.toFixed(2)}`} strong /> : undefined}
        />
      )}
    </ComposedChart>
  );
}
