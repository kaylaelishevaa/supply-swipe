"use client";
// S3 Live negotiation at 1280×800 (?view=desktop): agents either side of the current message,
// the price rail and full transcript below, the chart and approval card on the right.

/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import type { Deal, NegotiationView, Side } from "@/lib/types";
import * as api from "@/lib/api";
import { lastPrice, rmTotal, termsLine, useNegotiationReplay } from "@/lib/negotiation";
import { MessageBar } from "./MessageBar";
import { PriceRail } from "./PriceRail";
import { ConvergenceChart } from "./ConvergenceChart";
import { TypingDots } from "./TypingDots";
import { Wakil } from "./Wakil";
import { Button } from "./Button";
import { RoleSwitcher } from "./RoleSwitcher";

const DOT: Record<Side, string> = { buyer: "#6A5CF0", supplier: "#0E8A76" };

export function NegotiationDesktop({ view, deal }: { view: NegotiationView; deal?: Deal }) {
  const router = useRouter();
  const r = useNegotiationReplay(view.messages);
  const listRef = useRef<HTMLDivElement>(null);
  const NAME: Record<Side, string> = { buyer: api.wakilName(view.buyerId), supplier: api.wakilName(view.supplierId) };
  const biz = api.parties(view);
  const agreed = view.result === "deal";

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [r.step]);

  const met = r.shown >= view.messages.length;
  const dealPrice = met && agreed ? view.messages[view.messages.length - 1].pricePerKg : undefined;
  const pose = (s: Side) => (r.dealFound ? "happy" : r.speaking === s ? "speak" : r.next === s ? "think" : "idle");
  const cur = r.shown ? r.visible[r.shown - 1] : null;
  const curB = cur?.side === "buyer";

  const agent = (s: Side) => (
    <div className="flex flex-col items-center gap-2">
      <div className="relative h-[190px] w-[180px]">
        <div
          className="absolute bottom-1.5 left-1/2 -ml-[70px] h-[140px] w-[140px] rounded-full"
          style={{
            background: s === "buyer" ? "#E6E3FF" : "#D7F3EC",
            opacity: r.speaking === s || met ? 1 : 0,
            transform: `scale(${r.speaking === s ? 1.12 : 1})`,
            transition: "opacity .4s, transform .4s",
          }}
        />
        <Wakil side={s} width={180} height={190} pose={pose(s)} turn={s === "buyer" ? (r.speaking === "buyer" ? 42 : 28) : r.speaking === "supplier" ? -42 : -28} logo={biz[s].logo} className="absolute inset-0" />
      </div>
      <div className="text-center">
        <div className="text-[15px] font-semibold">{NAME[s]}</div>
        <div className="text-[12px] text-muted">{s === "buyer" ? "Buyer · Balanced" : `Supplier · Firm · on time ${api.publicPrices(view).onTime}`}</div>
      </div>
      <div className="h-3.5">{r.next === s && !r.dealFound && <TypingDots color={DOT[s]} />}</div>
    </div>
  );

  return (
    <div className="flex h-screen min-h-[720px] flex-col bg-bg text-ink tabular-nums">
      <div className="flex h-[60px] flex-none items-center gap-5 border-b border-line bg-white px-8">
        <img src="/logos/supplyswipe-lockup.png" alt="SupplySwipe" className="-ml-2 block h-[34px] w-auto" />
        <div className="text-[12px] text-muted">
          Orbyte module · {biz.buyer.name} × {biz.supplier.name}
        </div>
        <div className="flex-1" />
        {r.done ? (
          <button onClick={r.restart} className="whitespace-nowrap rounded-full border border-line px-3 py-1.5 text-[12px] text-muted">
            Replay
          </button>
        ) : (
          <button onClick={r.skip} className="whitespace-nowrap rounded-full bg-ink px-3.5 py-1.5 text-[12px] font-semibold text-white">
            Skip
          </button>
        )}
        <RoleSwitcher bordered />
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)_440px] gap-5 px-8 pb-6 pt-5">
        <div className="flex min-h-0 flex-col gap-4 rounded-[36px] bg-white px-7 py-[22px] shadow-[0_10px_30px_rgba(60,55,120,0.05)]">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="text-[22px] font-semibold">Live negotiation</div>
              <div className="mt-0.5 text-[13px] text-muted">
                {view.item} · {view.qtyLabel}
              </div>
            </div>
            <div className="flex w-[220px] flex-col gap-1.5">
              <MessageBar visible={r.visible} max={view.maxMessages} height={6} />
              <div className="text-right text-[11px] text-muted">
                <span className="font-semibold text-ink">
                  {r.shown} of {view.maxMessages}
                </span>{" "}
                messages · limit {view.maxMessages}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-[210px_minmax(0,1fr)_210px] items-center gap-3">
            {agent("buyer")}
            <div
              className="flex min-h-[170px] w-full flex-col gap-1.5 rounded-[20px] border px-5 py-[18px]"
              style={{
                background: cur ? (curB ? "#E6E3FF" : "#FFFFFF") : "#EFEEF6",
                borderColor: cur ? (curB ? "#D9D4FF" : "#C7EDE3") : "#E4E2EF",
                transform: `scale(${r.pop ? 1 : 0.9})`,
                opacity: r.pop ? 1 : 0,
                transformOrigin: cur ? (curB ? "0% 50%" : "100% 50%") : "50% 50%",
                transition: "transform .35s cubic-bezier(.2,1.4,.4,1), opacity .25s",
              }}
            >
              <div className="flex items-center gap-2 text-[12px]">
                <span className="whitespace-nowrap font-semibold">{cur ? NAME[cur.side] : "Both Wakils"}</span>
                <span className="font-mono text-[11px] font-semibold tracking-[0.08em]" style={{ color: cur ? DOT[cur.side] : "#6E6C86" }}>
                  {cur ? cur.type.toUpperCase() : "READY"}
                </span>
              </div>
              <div className="text-[34px] font-semibold tracking-[-0.02em]">{cur ? cur.headline : "Opening"}</div>
              <div className="text-[15px] leading-[1.45]">{cur ? cur.text : "Each side has its own limits. Neither can see the other's."}</div>
              <div className="mt-0.5 text-[12px] text-muted">Why: {cur ? cur.why : "swipe right by Aisyah started this"}</div>
            </div>
            {agent("supplier")}
          </div>

          <PriceRail view={view} buyerPrice={lastPrice(r.visible, "buyer")} supplierPrice={lastPrice(r.visible, "supplier")} dealPrice={dealPrice} size="desktop" />

          <div ref={listRef} className="no-scrollbar flex min-h-0 flex-1 flex-col gap-1.5 overflow-y-auto border-t border-line pt-3">
            {r.visible.map((m) => (
              <div key={m.n} className="grid grid-cols-[28px_150px_70px_minmax(0,1fr)] items-baseline gap-2.5 py-1 text-[12px]">
                <span className="font-mono text-[11px] text-muted">0{m.n}</span>
                <span className="flex items-center gap-1.5 font-semibold">
                  <span className="h-2 w-2 rounded-full" style={{ background: DOT[m.side] }} />
                  {NAME[m.side]}
                </span>
                <span className="font-mono text-[10px] font-semibold tracking-[0.08em]" style={{ color: DOT[m.side] }}>
                  {m.type.toUpperCase()}
                </span>
                <span>
                  {m.text} <span className="text-muted">Why: {m.why}</span>
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex min-h-0 flex-col gap-4">
          <div className="rounded-[30px] bg-white px-4 pb-2.5 pt-4 shadow-card">
            <div className="mb-2 flex items-baseline justify-between">
              <div className="text-[14px] font-semibold">Price per kg by round</div>
              <div className="flex gap-3 text-[11px] text-muted">
                <span className="flex items-center gap-[5px]">
                  <span className="h-0.5 w-3 bg-purple" />
                  Buyer
                </span>
                <span className="flex items-center gap-[5px]">
                  <span className="h-0.5 w-3 bg-teal" />
                  Supplier
                </span>
                <span className="flex items-center gap-[5px]">
                  <span className="w-3 border-t border-dashed border-muted" />
                  Market
                </span>
              </div>
            </div>
            <ConvergenceChart view={view} visible={r.visible} dealFound={r.dealFound} width={406} height={250} />
          </div>
          <div
            className="flex min-h-0 flex-1 flex-col justify-center gap-2.5 rounded-[20px] border-[1.5px] bg-white p-[18px]"
            style={{ borderColor: r.dealFound ? "#0E8A76" : "#E4E2EF", opacity: r.dealFound ? 1 : 0.35, transition: "opacity .4s" }}
          >
            <div className="text-[12px] font-semibold text-amber-text">
              {!r.dealFound ? "Negotiating · limits sealed on both sides" : agreed ? "Deal found · sending to both owners" : `No deal within ${view.maxMessages} messages · back to both owners`}
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-[32px] font-semibold tracking-[-0.02em]">{deal && agreed ? rmTotal(deal.terms.weeklyTotal) : "—"}</span>
              <span className="text-[13px] text-muted">per week</span>
            </div>
            <div className="text-[12px] text-muted">{deal && agreed ? termsLine(deal.terms) : ""}</div>
            <div className="mt-1 grid grid-cols-2 gap-2">
              <Button variant={r.dealFound && agreed ? "approve" : "disabled"} height={46} onClick={() => router.push(`/approve/${view.dealId}`)}>
                Approve
              </Button>
              <Button variant="secondary" height={46} fontSize={13} onClick={() => router.push(`/approve/${view.dealId}/counter`)}>
                Counter via Wakil
              </Button>
            </div>
            <div className="text-[11px] text-muted">{biz.supplier.short}&apos;s owner is approving too. Nothing is created until both tap.</div>
          </div>
        </div>
      </div>
    </div>
  );
}
