"use client";
// Shared post-tap states on the approval screens: approved and waiting for the other side,
// already sealed, or rejected. Used by S4, S4s and P3.

import { Link } from "wouter";
import * as api from "@/lib/api";
import type { Deal, Side } from "@/lib/types";
import { useDemo } from "@/lib/demo-context";
import { Button } from "./Button";
import { CheckIcon } from "./Icons";

/** This side approved; the other side has not yet. Offers the demo switch to the other owner. */
export function WaitingForOther({ deal, side }: { deal: Deal; side: Side }) {
  const { setSide, setRole } = useDemo();
  const mine = deal.approvals.find((a) => a.side === side);
  const other: Side = side === "buyer" ? "supplier" : "buyer";
  const OWNER = { buyer: api.people(deal, "buyer").owner, supplier: api.people(deal, "supplier").owner };
  const BIZ = { buyer: api.parties(deal).buyer.short, supplier: api.parties(deal).supplier.short };
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2.5 rounded-[22px] bg-teal-soft px-3.5 py-3">
        <span className="flex h-6 w-6 flex-none items-center justify-center rounded-full bg-white">
          <CheckIcon />
        </span>
        <div className="flex-1">
          <div className="text-[13px] font-semibold text-teal-text">
            Approved by {mine?.by ?? OWNER[side]} · {mine?.at} · waiting for {BIZ[other]}
          </div>
          <div className="text-[11px] text-teal-text">Nothing is created until both tap.</div>
        </div>
      </div>
      <Button
        variant="secondary"
        height={48}
        onClick={() => {
          setSide(other);
          setRole("owner");
        }}
      >
        Switch to {BIZ[other]}&apos;s view
      </Button>
      <div className="mt-1 grid grid-cols-2 gap-2">
        <Link
          href="/feed"
          className="flex h-11 items-center justify-center rounded-full border border-line bg-white text-[13px] font-semibold text-ink shadow-ctl hover:bg-bg"
        >
          ← Back to Feed
        </Link>
        <Link
          href={`/deal/${deal.id}`}
          className="flex h-11 items-center justify-center rounded-full bg-ink text-[13px] font-semibold text-white shadow-ink hover:opacity-90"
        >
          Deal chat →
        </Link>
      </div>
    </div>
  );
}

export function SealedLink({ deal }: { deal: Deal }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2.5 rounded-[22px] bg-teal-soft px-3.5 py-3">
        <span className="flex h-6 w-6 flex-none items-center justify-center rounded-full bg-white">
          <CheckIcon />
        </span>
        <div className="flex-1 text-[13px] font-semibold text-teal-text">Deal sealed · both owners approved</div>
      </div>
      <Link href={`/deal/${deal.id}/sealed`} className="flex h-12 items-center justify-center rounded-full bg-ink text-[14px] font-semibold text-white shadow-ink">
        Open the sealed deal
      </Link>
      <Link href="/feed" className="flex h-10 items-center justify-center rounded-full border border-line bg-white text-[13px] font-semibold text-muted">
        ← Back to Feed
      </Link>
    </div>
  );
}

export function RejectedNote() {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2.5 rounded-[22px] bg-coral-soft px-3.5 py-3">
        <span className="h-2.5 w-2.5 flex-none rounded-full bg-coral" />
        <div className="flex-1">
          <div className="text-[13px] font-semibold text-coral-text">Deal rejected</div>
          <div className="text-[11px] text-coral-text">No deal was created. The reason is in the log.</div>
        </div>
      </div>
      <Link href="/feed" className="flex h-11 items-center justify-center rounded-full border border-line bg-white text-[13px] font-semibold text-ink shadow-ctl">
        ← Back to Feed
      </Link>
    </div>
  );
}
