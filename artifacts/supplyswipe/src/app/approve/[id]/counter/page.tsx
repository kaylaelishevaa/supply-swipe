"use client";
// S4b Counter via Wakil: the owner types one line, the same Wakil resumes the same negotiation
// for at most 4 more messages. The note guides wording only; the sealed limit still holds.

import { Link } from "wouter";
import { useRouter } from "@/lib/navigation";
import { useEffect, useRef, useState } from "react";
import * as api from "@/lib/api";
import { useApi } from "@/lib/useApi";
import { useDemo } from "@/lib/demo-context";
import { rm, rmTotal, dayList } from "@/lib/negotiation";
import { Screen } from "@/components/Screen";
import { StatusBar } from "@/components/StatusBar";
import { Wakil } from "@/components/Wakil";
import { Button } from "@/components/Button";
import { ChevronLeft, LockIcon, XIcon } from "@/components/Icons";
import type { WakilPose } from "@/components/WakilAvatar";

const IDEAS = ["Try RM12.00", "Ask for 14-day terms", "Commit 8 weeks", "Deliver by 8am"];
/** A counter lets the Wakil send at most this many more messages, within the negotiation's limit. */
const COUNTER_MESSAGES = 4;

export default function CounterPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { side, role } = useDemo();
  const deal = useApi(() => api.getDeal(params.id), [params.id]);
  const ownId = deal ? (side === "buyer" ? deal.buyerId : deal.supplierId) : undefined;
  const own = useApi(() => (ownId ? api.getOwnLimit(side, ownId) : Promise.resolve(undefined)), [side, ownId]);
  const view = useApi(() => (deal ? api.getNegotiation(deal.negotiationId, side) : Promise.resolve(undefined)), [deal?.negotiationId, side]);
  const used = view?.messages.length ?? 0;
  const more = view ? Math.min(COUNTER_MESSAGES, view.maxMessages - used) : COUNTER_MESSAGES;
  // Used messages in their side's colour, the counter's extra messages in light purple, the rest empty.
  const segs = view
    ? Array.from({ length: view.maxMessages }, (_, i) =>
        i < used ? (view.messages[i].side === "buyer" ? "#6A5CF0" : "#0E8A76") : i < used + more ? "#C9C3F2" : "#E4E2EF",
      )
    : [];
  const [text, setText] = useState("Try RM12.00 if we commit for 8 weeks");
  const [sent, setSent] = useState(false);
  const [pose, setPose] = useState<WakilPose>("idle");
  const t = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(t.current), []);

  // Drag down to dismiss support
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const touchStartY = useRef(0);
  const sheetRef = useRef<HTMLDivElement>(null);

  const dismiss = () => {
    if (typeof window !== "undefined" && window.history.length > 2) {
      router.back();
    } else {
      router.push(`/approve/${params.id}`);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
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

  const send = async () => {
    if (sent || !text.trim()) return;
    setSent(true);
    setPose("speak");
    clearTimeout(t.current);
    t.current = setTimeout(() => setPose("idle"), 2200);
    await api.counterViaWakil(params.id, side, role, text.trim());
  };

  const buyer = side === "buyer";
  return (
    <Screen>
      <StatusBar />
      <div className="flex items-center justify-between px-4 pt-1">
        <button
          onClick={dismiss}
          className="flex items-center gap-1.5 rounded-full border border-line bg-white px-2.5 py-1 text-[13px] font-semibold text-ink shadow-ctl"
        >
          <ChevronLeft size={14} />
          <span>Back</span>
        </button>
        <div className="text-right">
          <div className="text-[11px] font-semibold text-amber-text">Deal waiting for you</div>
          <div className="text-[13px] font-extrabold">{deal ? `${rmTotal(deal.terms.weeklyTotal)}/wk` : ""}</div>
        </div>
      </div>

      <div className="px-4 pt-2">
        <div className="text-[12px] text-muted">
          {deal ? `${rm(deal.terms.pricePerKg)}/kg · ${deal.terms.qtyKgWeekly} kg ${dayList(deal.terms.days)} · ${deal.terms.paymentDays === 0 ? "COD" : `${deal.terms.paymentDays}-day terms`}` : ""}
        </div>
      </div>

      <div
        className="absolute inset-0 bg-overlay cursor-pointer"
        onClick={dismiss}
        aria-label="Dismiss counter"
      />

      <div
        ref={sheetRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          transform: `translateY(${dragY}px)`,
          transition: isDragging ? "none" : "transform 0.22s cubic-bezier(0.2, 0.8, 0.2, 1)",
        }}
        className="no-scrollbar absolute inset-x-0 bottom-0 flex max-h-[88dvh] flex-col gap-3.5 overflow-y-auto rounded-t-[32px] bg-bg px-4 pb-12 pt-2.5 shadow-hero overscroll-contain"
      >
        <div className="flex w-full cursor-grab justify-center py-1 active:cursor-grabbing">
          <div className="h-1.5 w-11 rounded-full bg-[#D4D1E4]" />
        </div>

        <div className="flex items-center justify-between">
          <button
            onClick={dismiss}
            className="flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[12px] font-semibold text-muted hover:text-ink active:scale-95 shadow-card"
            aria-label="Back"
          >
            <ChevronLeft size={14} />
            <span>Back</span>
          </button>
          <span className="text-[12px] font-semibold text-muted">Counter Offer</span>
          <button
            onClick={dismiss}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-muted hover:text-ink active:scale-95 shadow-card"
            aria-label="Close"
          >
            <XIcon size={14} color="#7B7891" />
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          <Wakil side={side} width={76} height={80} pose={pose} turn={-16} bust logo={ownId ? api.business(ownId).logo : undefined} style={{ margin: "-10px -4px -6px -10px" }} />
          <div className="flex-1">
            <div className="text-[20px] font-extrabold tracking-[-0.02em]">Counter via Wakil</div>
            <div className="text-[12px] text-muted">Tell it one thing. It picks up the same chat.</div>
          </div>
        </div>
        <textarea
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setSent(false);
          }}
          placeholder="e.g. Try RM12.00 if we commit for 8 weeks"
          className="min-h-[92px] resize-none rounded-[22px] bg-white px-4 py-3.5 text-[15px] leading-[1.5] text-ink shadow-card outline-none placeholder:text-muted"
        />
        <div className="flex flex-wrap gap-1.5">
          {IDEAS.map((label) => (
            <button
              key={label}
              onClick={() => {
                setText(label);
                setSent(false);
              }}
              className="flex h-[30px] items-center whitespace-nowrap rounded-full bg-white px-3 text-[12px] font-semibold shadow-[0_4px_10px_rgba(60,55,120,0.08)]"
            >
              {label}
            </button>
          ))}
        </div>
        <div className="flex flex-col gap-2 rounded-[22px] bg-white px-3.5 py-3 shadow-card">
          <div className="flex justify-between text-[12px]">
            <span className="text-muted">Messages left</span>
            <span className="font-semibold">up to {more} more</span>
          </div>
          <div className="grid gap-[3px]" style={{ gridTemplateColumns: `repeat(${segs.length || 10}, 1fr)` }}>
            {segs.map((c, i) => (
              <span key={i} className="h-[5px] rounded-[3px]" style={{ background: c }} />
            ))}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-purple-text">
            <LockIcon />
            {own != null &&
              (buyer
                ? `Your max RM${own.toFixed(2)} stays sealed. If your note asks for more, Wakil tells you instead.`
                : `Your floor RM${own.toFixed(2)} stays sealed. If your note asks for less, Wakil tells you instead.`)}
          </div>
        </div>
        <Button variant="wakil" height={54} onClick={send}>
          {sent ? "Sent · Wakil is negotiating" : "Send to Wakil"}
        </Button>
        {sent ? (
          <Link href={`/negotiation/${deal?.negotiationId ?? ""}`} className="text-center text-[12px] font-semibold text-purple-text">
            Back to the negotiation
          </Link>
        ) : (
          <div className="text-center text-[12px] text-muted">
            {deal ? `${api.people(deal, buyer ? "supplier" : "buyer").owner} sees the new offer, not your note.` : ""}
          </div>
        )}
      </div>
    </Screen>
  );
}
