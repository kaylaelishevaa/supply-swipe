"use client";
// P3 Approval inbox (supplier owner): the "Needs you" card for Restoran Mak Ngah with tiles vs the
// supplier's OWN floor and list price, why the Wakil said yes, Approve / Counter, and a rep-approved row.

import { useState } from "react";
import { useRouter } from "next/navigation";
import * as api from "@/lib/api";
import { useApi } from "@/lib/useApi";
import type { Deal } from "@/lib/types";
import { Screen } from "./Screen";
import { StatusBar } from "./StatusBar";
import { RoleSwitcher } from "./RoleSwitcher";
import { BusinessLogo } from "./BusinessLogo";
import { Button } from "./Button";
import { TabBar } from "./TabBar";
import { RejectForm } from "./RejectForm";
import { RejectedNote, SealedLink, WaitingForOther } from "./ApprovalStates";

const signed = (v: number) => (v < 0 ? "−" : "+") + "RM" + Math.abs(v).toFixed(2);

export function ApprovalInbox({ deal }: { deal: Deal }) {
  const router = useRouter();
  const [rejecting, setRejecting] = useState(false);
  // The supplier's own floor, read only on the supplier's screen.
  const floor = useApi(() => api.getOwnLimit("supplier"), []);
  const buyerApproval = deal.approvals.find((a) => a.side === "buyer");
  const mine = deal.approvals.some((a) => a.side === "supplier");
  const open = deal.status !== "sealed" && deal.status !== "rejected" && !mine;
  const price = deal.terms.pricePerKg;

  const approve = async () => {
    const r = await api.approve(deal.id, "supplier", "owner");
    if (r.ok && r.deal.status === "sealed") router.push(`/deal/${deal.id}/sealed`);
  };

  return (
    <Screen>
      <StatusBar />
      <div className="flex items-center justify-between px-4 pb-3.5 pt-1">
        <div>
          <div className="text-[22px] font-extrabold tracking-[-0.02em]">Approvals</div>
          <div className="mt-0.5 text-[12px] text-muted">Ayam Segar · Encik Roslan</div>
        </div>
        <RoleSwitcher bordered />
      </div>

      <div className="no-scrollbar flex min-h-0 flex-1 flex-col gap-2.5 overflow-y-auto px-4 pb-3">
        <div className={`text-[12px] font-semibold ${open ? "text-amber-text" : "text-muted"}`}>{open ? "Needs you · 1" : "This week"}</div>
        <div className={`flex flex-col gap-3 rounded-[16px] border-[1.5px] bg-white p-3.5 ${open ? "border-amber" : deal.status === "rejected" ? "border-coral" : "border-teal"}`}>
          <div className="flex items-center gap-2.5">
            <BusinessLogo src="/logos/mak-ngah.png" name="Restoran Mak Ngah" size={40} />
            <div className="flex-1">
              <div className="text-[14px] font-semibold">Restoran Mak Ngah</div>
              <div className="text-[11px] text-muted">
                {buyerApproval ? `Owner approved ${buyerApproval.at}` : "Owner not approved yet"} · above rep limit RM300
              </div>
            </div>
          </div>
          <div className="text-[13px] leading-[1.5]">Chicken breast · RM12.20/kg · 50 kg Mon and Thu · free delivery · 7-day terms · 2-week trial</div>
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-[12px] border border-line p-2.5">
              <div className="text-[11px] text-muted">vs floor</div>
              <div className="mt-0.5 text-[15px] font-semibold text-teal-text">{floor != null ? signed(price - floor) : ""}</div>
            </div>
            <div className="rounded-[12px] border border-line p-2.5">
              <div className="text-[11px] text-muted">vs list</div>
              <div className="mt-0.5 text-[15px] font-semibold">−RM0.60</div>
            </div>
            <div className="rounded-[12px] border border-line p-2.5">
              <div className="text-[11px] text-muted">Weekly</div>
              <div className="mt-0.5 text-[15px] font-semibold">RM{deal.terms.weeklyTotal}</div>
            </div>
          </div>
          <div className="rounded-[10px] bg-purple-soft px-3 py-2.5 text-[12px] leading-[1.45]">
            <span className="font-semibold text-purple-text">Why your Wakil said yes: </span>
            above floor, PJ is already on your Mon and Thu route, buyer pays in 7 days.
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
