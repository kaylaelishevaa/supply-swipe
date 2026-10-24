"use client";
// S4s Staff approval: staff can approve only up to their limit (Aisyah RM500, sales rep RM300).
// Above it, Approve is locked and "Ask <owner> to approve" sends one notification, with Undo.

import { useRef, useState } from "react";
import { useRouter } from "@/lib/navigation";
import * as api from "@/lib/api";
import { useApi } from "@/lib/useApi";
import { rmTotal } from "@/lib/negotiation";
import type { Deal, Side } from "@/lib/types";
import { Screen } from "./Screen";
import { StatusBar } from "./StatusBar";
import { RoleSwitcher } from "./RoleSwitcher";
import { BusinessLogo } from "./BusinessLogo";
import { LimitBar } from "./LimitBar";
import { Button } from "./Button";
import { ChevronLeft, XIcon } from "./Icons";
import { RejectedNote, SealedLink, WaitingForOther } from "./ApprovalStates";

/** Screen copy for the staff member on one side of the deal; names come from the deal's own businesses. */
function copy(deal: Deal, side: Side, limit: number) {
  const other: Side = side === "buyer" ? "supplier" : "buyer";
  const me = api.people(deal, side);
  const them = api.parties(deal)[other];
  return {
    title: side === "buyer" ? "Live negotiation" : "Approvals",
    signedIn: side === "buyer" ? `Signed in as ${me.staff} · ${me.staffTitle}` : `Signed in as ${me.staff} · ${me.short}`,
    owner: me.owner,
    them: them.short,
    logo: them.logo,
    wakil: api.wakilName(side === "buyer" ? deal.buyerId : deal.supplierId),
    answer: `${me.owner} gets one notification. You'll see the answer here.`,
    footer: `${side === "buyer" ? "Staff" : "Reps"} approve up to RM${limit}. Above that, only the owner can. Written to the log.`,
  };
}

export function StaffApproval({ deal, side }: { deal: Deal; side: Side }) {
  const router = useRouter();
  const limit = api.approvalLimit(side, "staff");
  const c = copy(deal, side, limit);
  const amount = deal.terms.weeklyTotal;
  const above = amount > limit;
  const approvedHere = deal.approvals.some((a) => a.side === side);
  const sent = !!deal.askedOwnerAt;
  const view = useApi(() => api.getNegotiation(deal.negotiationId, side), [deal.negotiationId, side]);

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
    const r = await api.approve(deal.id, side, "staff");
    if (r.ok && r.deal.status === "sealed") router.push(`/deal/${deal.id}/sealed`);
  };

  return (
    <Screen>
      <StatusBar />
      <div className="flex items-center justify-between px-4 pt-1">
        <div className="flex items-center gap-2">
          <button
            onClick={dismiss}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-line bg-white shadow-card"
            aria-label="Back"
          >
            <ChevronLeft size={16} />
          </button>
          <div>
            <div className="text-[20px] font-extrabold tracking-[-0.02em]">{c.title}</div>
            <div className="text-[11px] text-muted">{c.signedIn}</div>
          </div>
        </div>
        <RoleSwitcher />
      </div>

      <div
        className="absolute inset-0 top-[110px] bg-overlay cursor-pointer"
        onClick={dismiss}
        aria-label="Dismiss sheet"
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
          <span className="text-[12px] font-semibold text-muted">Staff Approval</span>
          <button
            onClick={dismiss}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-muted hover:text-ink active:scale-95 shadow-card"
            aria-label="Close"
          >
            <XIcon size={14} color="#7B7891" />
          </button>
        </div>

        <div className="flex items-center gap-2.5">
          <BusinessLogo src={c.logo} name={c.them} size={44} />
          <div className="flex-1">
            <div className="text-[14px] font-semibold">Deal with {c.them}</div>
            <div className="text-[11px] text-muted">
              Found by {c.wakil}
              {view ? ` · ${view.messages.length} of ${view.maxMessages} messages` : ""}
            </div>
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-[44px] font-extrabold leading-none tracking-[-0.03em]">{rmTotal(amount)}</span>
          <span className="text-[14px] text-muted">per week</span>
        </div>
        <LimitBar limit={limit} amount={amount} />

        {deal.status === "sealed" ? (
          <SealedLink deal={deal} />
        ) : deal.status === "rejected" ? (
          <RejectedNote />
        ) : approvedHere ? (
          <WaitingForOther deal={deal} side={side} />
        ) : above ? (
          <>
            <Button variant="disabled" height={54}>
              Approve · above your limit
            </Button>
            {!sent ? (
              <Button variant="primary" height={52} onClick={() => api.askOwner(deal.id, side)}>
                Ask {c.owner} to approve
              </Button>
            ) : (
              <div className="flex items-center gap-2.5 rounded-[22px] bg-amber-soft px-3.5 py-3">
                <span className="h-2.5 w-2.5 flex-none rounded-full bg-amber" />
                <div className="flex-1">
                  <div className="text-[13px] font-semibold text-ink">
                    Sent to {c.owner} · {deal.askedOwnerAt}
                  </div>
                  <div className="text-[11px] text-amber-text">{c.answer}</div>
                </div>
                <button onClick={() => api.undoAskOwner(deal.id, side)} className="text-[12px] font-semibold text-amber-text">
                  Undo
                </button>
              </div>
            )}
          </>
        ) : (
          <Button variant="approve" height={54} onClick={approve}>
            Approve
          </Button>
        )}

        {deal.status !== "sealed" && deal.status !== "rejected" && !approvedHere && (
          <Button variant="secondary" height={46} onClick={() => router.push(`/approve/${deal.id}/counter`)}>
            Counter via Wakil
          </Button>
        )}
        <div className="text-center text-[11px] text-muted">{c.footer}</div>
      </div>
    </Screen>
  );
}
