"use client";
// Pinned terms card (teal outline): the locked deal terms at the top of the deal chat.
// Chat messages can never change these; only Renegotiate can.

import type { ReactNode } from "react";
import type { Deal } from "@/lib/types";

export function PinnedTerms({ deal, actions }: { deal: Deal; actions?: ReactNode }) {
  const t = deal.terms;
  const sealed = deal.status === "sealed";
  return (
    <div className="flex flex-col gap-2.5 rounded-[14px] border-[1.5px] border-teal bg-white p-3.5">
      <div className="flex items-center justify-between">
        <span
          className={`flex h-[22px] items-center whitespace-nowrap rounded-full px-2 text-[11px] font-semibold ${
            sealed ? "bg-teal-soft text-teal-text" : "bg-amber-soft text-amber-text"
          }`}
        >
          {sealed ? "Agreed 22 Oct · both approved" : "Proposed 22 Oct · waiting for approval"}
        </span>
        <span className="text-[11px] text-muted">Deal #{deal.id}</span>
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className="text-[24px] font-semibold">RM{t.pricePerKg.toFixed(2)}/kg</span>
        <span className="text-[13px] text-muted">· RM{t.weeklyTotal} per week</span>
      </div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[12px] text-muted">
        <span>{t.qtyKgWeekly} kg weekly</span>
        <span>
          {t.days.join(", ")} before {t.before}
        </span>
        <span>{t.deliveryRule}</span>
        <span>
          {t.paymentDays}-day terms{t.trialWeeks ? ` · ${t.trialWeeks}-week trial` : ""}
        </span>
      </div>
      {actions && <div className="mt-0.5 grid grid-cols-2 gap-2">{actions}</div>}
    </div>
  );
}
