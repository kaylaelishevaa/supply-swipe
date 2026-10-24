"use client";
// P3 Approval inbox (supplier owner): the "Needs you" card for the deal's buyer with tiles vs the
// supplier's OWN floor and list price, why the Wakil said yes, Approve / Counter, and a rep-approved row.

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as api from "@/lib/api";
import { useApi } from "@/lib/useApi";
import { dayList, rmDiff, rmTotal, termsLine } from "@/lib/negotiation";
import type { Deal } from "@/lib/types";
import { Screen } from "./Screen";
import { StatusBar } from "./StatusBar";
import { RoleSwitcher } from "./RoleSwitcher";
import { BusinessLogo } from "./BusinessLogo";
import { Button } from "./Button";
import { TabBar } from "./TabBar";
import { ChevronLeft } from "./Icons";
import { RejectForm } from "./RejectForm";
import { RejectedNote, SealedLink, WaitingForOther } from "./ApprovalStates";

export function ApprovalInbox({ deal }: { deal: Deal }) {
  const router = useRouter();
  const [rejecting, setRejecting] = useState(false);
  // The supplier's own floor, read only on the supplier's screen.
  const floor = useApi(() => api.getOwnLimit("supplier", deal.supplierId), [deal.supplierId]);
  const buyerApproval = deal.approvals.find((a) => a.side === "buyer");
  const mine = deal.approvals.some((a) => a.side === "supplier");
  const open = deal.status !== "sealed" && deal.status !== "rejected" && !mine;
  const price = deal.terms.pricePerKg;
  const listPrice = api.publicPrices(deal).listPerKg;
  const repLimit = api.approvalLimit("supplier", "staff");
  const biz = api.parties(deal);
  const days = dayList(deal.terms.days);
  const pays = deal.terms.paymentDays === 0 ? "cash on delivery" : `in ${deal.terms.paymentDays} days`;

  const approve = async () => {
    const r = await api.approve(deal.id, "supplier", "owner");
    if (r.ok && r.deal.status === "sealed") router.push(`/deal/${deal.id}/sealed`);
  };

  return (
    <Screen>
      <StatusBar />
      <div className="flex items-center justify-between px-4 pb-3.5 pt-1">
        <div className="flex items-center gap-2">
          <Link
            href="/feed"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-line bg-white shadow-card"
            aria-label="Back to feed"
          >
            <ChevronLeft size={16} />
          </Link>
          <div>
            <div className="text-[20px] font-extrabold tracking-[-0.02em]">Approvals</div>
            <div className="text-[11px] text-muted">
              {biz.supplier.short} · {biz.supplier.owner}
            </div>
          </div>
        </div>
        <RoleSwitcher bordered />
      </div>

      <div className="no-scrollbar flex min-h-0 flex-1 flex-col gap-2.5 overflow-y-auto px-4 pb-3">
        <div className={`text-[12px] font-semibold ${open ? "text-amber-text" : "text-muted"}`}>{open ? "Needs you · 1" : "This week"}</div>
        <div className={`flex flex-col gap-3 rounded-[16px] border-[1.5px] bg-white p-3.5 ${open ? "border-amber" : deal.status === "rejected" ? "border-coral" : "border-teal"}`}>
          <div className="flex items-center gap-2.5">
            <BusinessLogo src={biz.buyer.logo} name={biz.buyer.name} size={40} />
            <div className="flex-1">
              <div className="text-[14px] font-semibold">{biz.buyer.name}</div>
              <div className="text-[11px] text-muted">
                {buyerApproval ? `Owner approved ${buyerApproval.at}` : "Owner not approved yet"} ·{" "}
                {deal.terms.weeklyTotal > repLimit ? "above" : "within"} rep limit RM{repLimit}
              </div>
            </div>
          </div>
          <div className="text-[13px] leading-[1.5]">Chicken breast · {termsLine(deal.terms)}</div>
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-[12px] border border-line p-2.5">
              <div className="text-[11px] text-muted">vs floor</div>
              <div className="mt-0.5 text-[15px] font-semibold text-teal-text">{floor != null ? rmDiff(price - floor) : ""}</div>
            </div>
            <div className="rounded-[12px] border border-line p-2.5">
              <div className="text-[11px] text-muted">vs list</div>
              <div className="mt-0.5 text-[15px] font-semibold">{rmDiff(price - listPrice)}</div>
            </div>
            <div className="rounded-[12px] border border-line p-2.5">
              <div className="text-[11px] text-muted">Weekly</div>
              <div className="mt-0.5 text-[15px] font-semibold">{rmTotal(deal.terms.weeklyTotal)}</div>
            </div>
          </div>
          <div className="rounded-[10px] bg-purple-soft px-3 py-2.5 text-[12px] leading-[1.45]">
            <span className="font-semibold text-purple-text">Why your Wakil said yes: </span>
            above floor, {days} drops to {biz.buyer.short}, buyer pays {pays}.
          </div>

          {deal.status === "sealed" ? (
            <SealedLink deal={deal} />
          ) : deal.status === "rejected" ? (
            <RejectedNote />
          ) : mine ? (
            <WaitingForOther deal={deal} side="supplier" />
          ) : rejecting ? (
            <RejectForm
              onCancel={() => setRejecting(false)}
              onReject={async (reason) => {
                await api.reject(deal.id, "supplier", "owner", reason);
                setRejecting(false);
              }}
            />
          ) : (
            <>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="approve" height={48} fontSize={15} onClick={approve}>
                  Approve
                </Button>
                <Button variant="secondary" height={48} onClick={() => router.push(`/approve/${deal.id}/counter`)}>
                  Counter via Wakil
                </Button>
              </div>
              <button onClick={() => setRejecting(true)} className="-mt-1 text-center text-[12px] font-semibold text-coral-text">
                Reject with reason
              </button>
            </>
          )}
        </div>

        <div className="mt-1.5 text-[12px] font-semibold text-muted">Done</div>
        <div className="flex items-center gap-2.5 rounded-[24px] bg-white p-3.5 shadow-card">
          <BusinessLogo src="/logos/seng-huat.png" name="Kedai Kopi Seng Huat" size={40} />
          <div className="flex-1">
            <div className="text-[14px] font-semibold">Kedai Kopi Seng Huat</div>
            <div className="text-[11px] text-muted">20 kg · RM12.70/kg · COD · RM254</div>
          </div>
          <span className="flex h-[22px] items-center whitespace-nowrap rounded-full bg-teal-soft px-2 text-[11px] font-semibold text-teal-text">Rep approved</span>
        </div>
        <div className="px-1 text-[11px] text-muted">Under the rep&apos;s RM300 limit, so it did not need you. It is in the log.</div>
      </div>
      <TabBar active="deals" />
    </Screen>
  );
}
