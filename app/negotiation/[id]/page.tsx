"use client";
// S3 Live negotiation (hero). Replays the two Wakils' messages 1.5s apart, moves the price rail,
// draws the chart point by point, then slides up a compact approval sheet without dimming.
// ?view=desktop renders the 1280 layout instead.

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import * as api from "@/lib/api";
import { useApi } from "@/lib/useApi";
import { useDemo } from "@/lib/demo-context";
import { lastPrice, rm, rmTotal, useNegotiationReplay } from "@/lib/negotiation";
import type { Deal, NegotiationView } from "@/lib/types";
import { Screen } from "@/components/Screen";
import { StatusBar } from "@/components/StatusBar";
import { ChevronLeft, LockIcon } from "@/components/Icons";
import { MessageBar } from "@/components/MessageBar";
import { PriceRail } from "@/components/PriceRail";
import { OfferBubble } from "@/components/OfferBubble";
import { ConvergenceChart } from "@/components/ConvergenceChart";
import { TypingDots } from "@/components/TypingDots";
import { Wakil } from "@/components/Wakil";
import { Button } from "@/components/Button";
import { NegotiationDesktop } from "@/components/NegotiationDesktop";

export default function NegotiationPage({ params }: { params: { id: string } }) {
  const { side } = useDemo();
  const view = useApi(() => api.getNegotiation(params.id, side), [params.id, side]);
  const deal = useApi(() => (view ? api.getDeal(view.dealId) : Promise.resolve(undefined)), [view?.dealId]);
  const desktop = useSearchParams().get("view") === "desktop";
  if (!view) return <Screen>{null}</Screen>;
  return desktop ? <NegotiationDesktop view={view} deal={deal} /> : <NegotiationMobile view={view} deal={deal} />;
}

function NegotiationMobile({ view, deal }: { view: NegotiationView; deal?: Deal }) {
  const router = useRouter();
  const r = useNegotiationReplay(view.messages, 1500);
  const [tab, setTab] = useState<"chat" | "chart">("chat");
  const scrollRef = useRef<HTMLDivElement>(null);
  const wakilName = { buyer: "Wakil Mak Ngah", supplier: "Wakil Ayam Segar" };

  // Auto-scroll to the newest message, and again ~550ms later once the sheet has opened.
  useEffect(() => {
    const go = () => scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    go();
    const t = setTimeout(go, 550);
    return () => clearTimeout(t);
  }, [r.step, tab]);

  const buyerPrice = lastPrice(r.visible, "buyer");
  const supplierPrice = lastPrice(r.visible, "supplier");
  const met = r.shown >= view.messages.length;
  const dealPrice = met ? view.messages[view.messages.length - 1].pricePerKg : undefined;
  const pose = (s: "buyer" | "supplier") => (r.dealFound ? "happy" : r.speaking === s ? "speak" : r.next === s ? "think" : "idle");
  const glow = (s: "buyer" | "supplier") => r.speaking === s || met;
  const typing = r.shown < view.messages.length && !r.dealFound;

  return (
    <Screen>
      <StatusBar />
      <div className="flex flex-none items-center gap-3 px-4 pb-2.5 pt-0.5">
        <Link href="/feed" aria-label="Back to feed" className="flex h-8 w-8 flex-none items-center justify-center rounded-[10px] border border-line bg-white">
          <ChevronLeft />
        </Link>
        <div className="min-w-0 flex-1">
          <div className="text-[22px] font-extrabold leading-[1.2] tracking-[-0.02em]">Live negotiation</div>
          <div className="mt-0.5 text-[12px] text-muted">
            {view.item} · {view.qtyLabel}
          </div>
        </div>
        <button onClick={r.restart} className="whitespace-nowrap rounded-full border border-line bg-white px-2.5 py-1.5 text-[12px] text-muted">
          Replay
        </button>
      </div>

      <div className="flex flex-none flex-col gap-1.5 px-4 pb-2.5">
        <MessageBar visible={r.visible} max={view.maxMessages} />
        <div className="flex justify-between whitespace-nowrap text-[11px] text-muted">
          <span>
            <span className="font-semibold text-ink">
              {r.shown} of {view.maxMessages}
            </span>{" "}
            messages
          </span>
          <span>Hard limit 10, then it asks you</span>
        </div>
      </div>

      {/* Arena */}
      <div className="mx-4 flex flex-none flex-col gap-1.5 rounded-[36px] bg-white px-3.5 pb-2 pt-2.5 shadow-[0_10px_30px_rgba(60,55,120,0.06)]">
        <div className="grid grid-cols-[1fr_auto_1fr] items-start">
          {(["buyer", "lock", "supplier"] as const).map((slot) =>
            slot === "lock" ? (
              <div key="lock" className="flex w-10 flex-col items-center gap-1 pt-[34px]">
                <div className="flex h-[34px] w-[34px] items-center justify-center rounded-full border border-line bg-bg">
                  <LockIcon size={12} />
                </div>
                <div className="text-center text-[9px] font-semibold leading-[1.3] text-purple-text">
                  both limits
                  <br />
                  sealed
                </div>
              </div>
            ) : (
              <div key={slot} className="flex flex-col items-center gap-1.5">
                <div className="relative -mt-2 h-[112px] w-[124px]">
                  <div
                    className="absolute bottom-1 left-1/2 -ml-[42px] h-[84px] w-[84px] rounded-full"
                    style={{
                      background: slot === "buyer" ? "#E6E3FF" : "#D7F3EC",
                      opacity: glow(slot) ? 1 : 0,
                      transform: `scale(${r.speaking === slot ? 1.12 : 1})`,
                      transition: "opacity .4s, transform .4s",
                    }}
                  />
                  <Wakil
                    side={slot}
                    width={124}
                    height={112}
                    pose={pose(slot)}
                    turn={slot === "buyer" ? (r.speaking === "buyer" ? 42 : 28) : r.speaking === "supplier" ? -42 : -28}
                    className="absolute inset-0"
                  />
                </div>
                <div className="text-center">
                  <div className="whitespace-nowrap text-[13px] font-semibold">{wakilName[slot]}</div>
                  <div className="text-[11px] text-muted">{slot === "buyer" ? "Buyer · Balanced" : "Supplier · Firm"}</div>
                </div>
                <div className="h-3.5">{r.next === slot && !r.dealFound && <TypingDots color={slot === "buyer" ? "#6A5CF0" : "#0E8A76"} />}</div>
              </div>
            ),
          )}
        </div>
        <PriceRail view={view} buyerPrice={buyerPrice} supplierPrice={supplierPrice} dealPrice={dealPrice} />
      </div>

      {/* Tabs */}
      <div className="mx-4 mt-2.5 grid flex-none grid-cols-2 rounded-full bg-line p-1">
        {(["chat", "chart"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex h-8 items-center justify-center gap-1.5 rounded-full text-[12px] font-semibold ${
              tab === t ? "bg-white text-ink shadow-[0_4px_10px_rgba(60,55,120,0.12)]" : "text-muted"
            }`}
          >
            {t === "chat" ? (
              <>
                Chat
                <span className="flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-purple px-[5px] text-[10px] text-white">{r.shown}</span>
              </>
            ) : (
              "Price chart"
            )}
          </button>
        ))}
      </div>

      {tab === "chat" ? (
        <div
          ref={scrollRef}
          className="no-scrollbar flex min-h-0 flex-1 flex-col gap-2.5 overflow-y-auto px-4 pt-3 transition-[padding] duration-300"
          style={{ paddingBottom: r.sheetOpen ? 170 : 14 }}
        >
          <div className="self-center whitespace-nowrap rounded-full bg-line px-2.5 py-[3px] text-[10px] text-muted">Today · both limits sealed</div>
          {r.visible.map((m, i) => (
            <OfferBubble key={m.n} m={m} who={wakilName[m.side]} pop={i < r.shown - 1 || r.pop} />
          ))}
          {typing && r.next && (
            <div
              className="flex items-center gap-2 rounded-[18px] bg-white px-3.5 py-2.5 shadow-bubble"
              style={{ alignSelf: r.next === "buyer" ? "flex-start" : "flex-end" }}
            >
              <div className="h-3">
                <TypingDots color={r.next === "buyer" ? "#6A5CF0" : "#0E8A76"} />
              </div>
              <span className="whitespace-nowrap text-[11px] text-muted">{wakilName[r.next]} is writing</span>
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="mx-4 mt-2.5 flex-none rounded-[24px] bg-white px-3 pb-1.5 pt-2.5 shadow-card">
            <div className="mb-0.5 flex items-baseline justify-between">
              <div className="text-[12px] font-semibold">Price per kg by round</div>
              <div className="flex gap-2.5 text-[10px] text-muted">
                <span className="flex items-center gap-1">
                  <span className="h-0.5 w-2.5 bg-purple" />
                  Buyer
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-0.5 w-2.5 bg-teal" />
                  Supplier
                </span>
              </div>
            </div>
            <ConvergenceChart view={view} visible={r.visible} dealFound={r.dealFound} />
          </div>
          <div className="flex-1" />
        </>
      )}

      <div className="flex flex-none items-center gap-2.5 bg-white px-4 pb-7 pt-3 shadow-[0_-8px_24px_rgba(60,55,120,0.06)]">
        <span className="h-2 w-2 flex-none rounded-full" style={{ background: r.dealFound ? "#0E8A76" : "#6A5CF0" }} />
        <div className="flex-1 text-[13px] font-semibold">{r.dealFound ? "Deal found · sending to both owners" : "Negotiating · limits sealed on both sides"}</div>
        <div className="text-[11px] text-muted">You approve the result</div>
      </div>

      {/* Compact approval sheet: slides up without dimming the screen. */}
      <div
        className="absolute inset-x-0 bottom-0 flex flex-col gap-3 rounded-t-[28px] bg-white px-4 pb-[26px] pt-2.5 shadow-[0_-14px_40px_rgba(60,55,120,0.18)]"
        style={{ transform: `translateY(${r.sheetOpen ? "0%" : "105%"})`, transition: "transform .5s cubic-bezier(.2,.8,.2,1)" }}
        aria-hidden={!r.sheetOpen}
      >
        <div className="h-1 w-9 self-center rounded-[2px] bg-line" />
        <div className="text-[12px] font-semibold text-amber-text">Deal found · waiting for both owners</div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-[28px] font-extrabold tracking-[-0.02em]">{deal ? rmTotal(deal.terms.weeklyTotal) : ""}</span>
          <span className="text-[13px] text-muted">
            {deal ? `per week · ${rm(deal.terms.pricePerKg)}/kg · ${deal.terms.paymentDays}-day terms` : ""}
          </span>
        </div>
        <div className="grid grid-cols-[2fr_1fr] gap-2">
          <Button variant="approve" height={48} fontSize={15} onClick={() => router.push(`/approve/${view.dealId}`)}>
            Approve
          </Button>
          <Button variant="secondary" height={48} onClick={() => router.push(`/approve/${view.dealId}/counter`)}>
            Counter
          </Button>
        </div>
      </div>
    </Screen>
  );
}
