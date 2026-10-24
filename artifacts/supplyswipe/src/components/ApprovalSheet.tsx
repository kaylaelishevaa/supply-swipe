"use client";
// S4 Approval sheet (buyer owner): the deal slides over the dimmed transcript with counterfactual tiles,
// one teal Approve, Counter via Wakil, and Reject with reason. Nothing is created until both owners tap.

import { useRef, useState } from "react";
import { useRouter } from "@/lib/navigation";
import * as api from "@/lib/api";
import { useApi } from "@/lib/useApi";
import { rm, rmDiff, rmTotal, termsLine } from "@/lib/negotiation";
import type { Deal } from "@/lib/types";
import { Screen } from "./Screen";
import { StatusBar } from "./StatusBar";
import { Wakil } from "./Wakil";
import { Button } from "./Button";
import { ChevronLeft, XIcon } from "./Icons";
import { RejectForm } from "./RejectForm";
import { RejectedNote, SealedLink, WaitingForOther } from "./ApprovalStates";

export function ApprovalSheet({ deal }: { deal: Deal }) {
  const router = useRouter();
  const [rejecting, setRejecting] = useState(false);
  const mine = deal.approvals.some((a) => a.side === "buyer");
  const theirs = deal.approvals.some((a) => a.side === "supplier");
  const view = useApi(() => api.getNegotiation(deal.negotiationId, "buyer"), [deal.negotiationId]);
  const pub = api.publicPrices(deal);
  const biz = api.parties(deal);
  const price = deal.terms.pricePerKg;
  const vsLastWeek = price - pub.lastWeekPerKg;
  const vsMarket = price - pub.marketPerKg;
  // The last few messages of the negotiation, dimmed behind the sheet.
  const background = view?.messages.slice(-4) ?? [];

  // Drag down to dismiss support
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const touchStartY = useRef(0);
  const sheetRef = useRef<HTMLDivElement>(null);

  const dismiss = () => {
    if (typeof window !== "undefined" && window.history.length > 2) {
      router.back();
    } else {
      router.push("/feed");
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    // Only drag when scrolled near the top of the sheet
    if (sheetRef.current && sheetRef.current.scrollTop > 10) return;
    touchStartY.current = e.touches[0].clientY;
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const diff = e.touches[0].clientY - touchStartY.current;
    if (diff > 0) {
      setDragY(diff);
    } else {
      setDragY(0);
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    if (dragY > 80) {
      dismiss();
    } else {
      setDragY(0);
    }
  };

  const approve = async () => {
    const r = await api.approve(deal.id, "buyer", "owner");
    if (r.ok && r.deal.status === "sealed") router.push(`/deal/${deal.id}/sealed`);
  };

  return (
    <Screen>
      <StatusBar />
      {/* Background navigation & transcript */}
      <div className="flex items-center justify-between px-4 pb-2.5 pt-1">
        <button
          onClick={dismiss}
          className="flex items-center gap-1.5 rounded-full border border-line bg-white px-2.5 py-1 text-[13px] font-semibold text-ink shadow-ctl"
        >
          <ChevronLeft size={14} />
          <span>Feed</span>
        </button>
        <div className="text-[12px] text-muted">{biz.buyer.name}</div>
      </div>

      <div className="px-4 pb-3">
        <div className="text-[20px] font-extrabold tracking-[-0.02em]">Live negotiation</div>
        <div className="mt-0.5 text-[12px] text-muted">Chicken breast, skinless · 50 kg weekly</div>
      </div>

      <div className="flex flex-col gap-3 px-4">
        {background.map((m) => (
          <div
            key={m.n}
            className={`max-w-[86%] rounded-[14px] px-3 py-2.5 text-[13px] leading-[1.45] ${
              m.side === "buyer" ? "self-end bg-purple-soft" : "self-start border border-line bg-white"
            }`}
          >
            {m.text}
          </div>
        ))}
      </div>

      {/* Dimmed backdrop - tapping dismisses sheet */}
      <div
        className="absolute inset-0 bg-overlay cursor-pointer"
        onClick={dismiss}
        aria-label="Dismiss sheet"
      />

      {/* Slide-up approval sheet */}
      <div
        ref={sheetRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          transform: `translateY(${dragY}px)`,
          transition: isDragging ? "none" : "transform 0.22s cubic-bezier(0.2, 0.8, 0.2, 1)",
        }}
        className="no-scrollbar absolute inset-x-0 bottom-0 flex max-h-[88dvh] flex-col gap-4 overflow-y-auto rounded-t-[28px] bg-white px-4 pb-12 pt-2.5 shadow-hero overscroll-contain"
      >
        {/* Grab bar indicator */}
        <div className="flex w-full cursor-grab justify-center py-1 active:cursor-grabbing">
          <div className="h-1.5 w-11 rounded-full bg-line" />
        </div>

        {/* Sheet Top Navigation Bar */}
        <div className="flex items-center justify-between">
          <button
            onClick={dismiss}
            className="flex items-center gap-1 rounded-full bg-bg px-2.5 py-1 text-[12px] font-semibold text-muted hover:text-ink active:scale-95"
            aria-label="Back"
          >
            <ChevronLeft size={14} />
            <span>Back</span>
          </button>
          <span className="text-[12px] font-semibold text-muted">Deal Review</span>
          <button
            onClick={dismiss}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-bg text-muted hover:text-ink active:scale-95"
            aria-label="Close sheet"
          >
            <XIcon size={14} color="#7B7891" />
          </button>
        </div>

        <div className="flex items-center gap-2.5">
          <Wakil side="buyer" width={50} height={54} pose="idle" turn={-20} bust logo={biz.buyer.logo} style={{ margin: "-8px -4px" }} />
          <div className="flex-1">
            <div className="text-[14px] font-semibold">{api.wakilName(deal.buyerId)} found a deal</div>
            <div className="text-[11px] text-muted">
              With {biz.supplier.name}
              {view ? ` · ${view.messages.length} of ${view.maxMessages} messages` : ""}
            </div>
          </div>
          {deal.status !== "sealed" && deal.status !== "rejected" && !mine && (
            <div className="flex h-6 items-center whitespace-nowrap rounded-full bg-amber-soft px-2.5 text-[11px] font-semibold text-amber-text">Needs you</div>
          )}
        </div>

        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-[40px] font-semibold leading-none tracking-[-0.03em]">{rmTotal(deal.terms.weeklyTotal)}</span>
            <span className="text-[14px] text-muted">per week</span>
          </div>
          <div className="text-pretty mt-2 text-[13px] leading-[1.5]">{termsLine(deal.terms)}</div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-[12px] border border-line p-2.5">
            <div className="text-[11px] text-muted">vs last week</div>
            <div className={`mt-1 text-[16px] font-semibold ${vsLastWeek < 0 ? "text-teal-text" : ""}`}>{rmDiff(vsLastWeek)}</div>
            <div className="text-[11px] text-muted">per kg</div>
          </div>
          <div className="rounded-[12px] border border-line p-2.5">
            <div className="text-[11px] text-muted">vs market</div>
            <div className={`mt-1 text-[16px] font-semibold ${vsMarket < 0 ? "text-teal-text" : ""}`}>{rmDiff(vsMarket)}</div>
            <div className="text-[11px] text-muted">PriceCatcher</div>
          </div>
          <div className="rounded-[12px] border border-line p-2.5">
            <div className="text-[11px] text-muted">Haggle saved</div>
            <div className="mt-1 text-[16px] font-semibold">12 min</div>
            <div className="text-[11px] text-muted">this week</div>
          </div>
        </div>
        <div className="text-[11px] leading-[1.45] text-muted">
          Why: market {rm(pub.marketPerKg)}, supplier on time {pub.onTime},{" "}
          {vsMarket <= 0
            ? `${rm(-vsMarket)} under market.`
            : deal.terms.deliveryRule.startsWith("Free")
              ? `free delivery covers the extra ${rm(vsMarket)}.`
              : `a reliable supplier for ${rm(vsMarket)} over market.`}
        </div>

        {deal.status === "sealed" ? (
          <SealedLink deal={deal} />
        ) : deal.status === "rejected" ? (
          <RejectedNote />
        ) : mine ? (
          <WaitingForOther deal={deal} side="buyer" />
        ) : rejecting ? (
          <RejectForm
            onCancel={() => setRejecting(false)}
            onReject={async (reason) => {
              await api.reject(deal.id, "buyer", "owner", reason);
              setRejecting(false);
            }}
          />
        ) : (
          <div className="flex flex-col gap-2">
            <Button variant="approve" height={52} fontSize={16} onClick={approve}>
              Approve
            </Button>
            <Button variant="secondary" height={48} onClick={() => router.push(`/approve/${deal.id}/counter`)}>
              Counter via Wakil
            </Button>
            <button onClick={() => setRejecting(true)} className="py-1.5 text-center text-[12px] font-semibold text-coral-text">
              Reject with reason
            </button>
          </div>
        )}

        {!mine && deal.status !== "sealed" && deal.status !== "rejected" && (
          <div className="flex items-start gap-2 rounded-[10px] bg-bg px-3 py-2.5 text-[12px] leading-[1.45]">
            <span className="mt-[5px] h-2 w-2 flex-none rounded-full bg-amber" />
            <span>
              {theirs
                ? `${biz.supplier.short}'s owner already approved. Your tap creates the deal.`
                : `${biz.supplier.short}'s owner is approving too. Nothing is created until both tap.`}
            </span>
          </div>
        )}
      </div>
    </Screen>
  );
}
