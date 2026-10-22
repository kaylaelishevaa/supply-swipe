"use client";
// S4s Staff approval: staff can approve only up to their limit (Aisyah RM500, sales rep RM300).
// Above it, Approve is locked and "Ask <owner> to approve" sends one notification, with Undo.

import { useRouter } from "next/navigation";
import * as api from "@/lib/api";
import type { Deal, Side } from "@/lib/types";
import { Screen } from "./Screen";
import { StatusBar } from "./StatusBar";
import { RoleSwitcher } from "./RoleSwitcher";
import { BusinessLogo } from "./BusinessLogo";
import { LimitBar } from "./LimitBar";
import { Button } from "./Button";
import { RejectedNote, SealedLink, WaitingForOther } from "./ApprovalStates";

const COPY: Record<Side, { title: string; signedIn: string; owner: string; them: string; logo: string; wakil: string; answer: string; footer: string }> = {
  buyer: {
    title: "Live negotiation",
    signedIn: "Signed in as Aisyah · kitchen lead",
    owner: "Mak Ngah",
    them: "Ayam Segar",
    logo: "/logos/ayam-segar.png",
    wakil: "Wakil Mak Ngah",
    answer: "She gets one notification. You'll see her answer here.",
    footer: "Staff approve up to RM500. Above that, only the owner can. Written to the log.",
  },
  supplier: {
    title: "Approvals",
    signedIn: "Signed in as Sales rep · Ayam Segar",
    owner: "Encik Roslan",
    them: "Restoran Mak Ngah",
    logo: "/logos/mak-ngah.png",
    wakil: "Wakil Ayam Segar",
    answer: "Encik Roslan gets one notification. You'll see the answer here.",
    footer: "Reps approve up to RM300. Above that, only the owner can. Written to the log.",
  },
};

export function StaffApproval({ deal, side }: { deal: Deal; side: Side }) {
  const router = useRouter();
  const c = COPY[side];
  const limit = api.approvalLimit(side, "staff");
  const amount = deal.terms.weeklyTotal;
  const above = amount > limit;
  const approvedHere = deal.approvals.some((a) => a.side === side);
  const sent = !!deal.askedOwnerAt;

  const approve = async () => {
    const r = await api.approve(deal.id, side, "staff");
    if (r.ok && r.deal.status === "sealed") router.push(`/deal/${deal.id}/sealed`);
  };

  return (
    <Screen>
      <StatusBar />
      <div className="flex items-center justify-between px-4 pt-1">
        <div>
          <div className="text-[22px] font-extrabold tracking-[-0.02em]">{c.title}</div>
          <div className="mt-0.5 text-[12px] text-muted">{c.signedIn}</div>
        </div>
        <RoleSwitcher />
      </div>

      <div className="absolute inset-0 top-[110px] bg-overlay" />
      <div className="absolute inset-x-0 bottom-0 flex flex-col gap-3.5 rounded-t-[32px] bg-bg px-4 pb-[30px] pt-2.5">
        <div className="h-[5px] w-10 self-center rounded-[3px] bg-[#D4D1E4]" />
        <div className="flex items-center gap-2.5">
          <BusinessLogo src={c.logo} name={c.them} size={44} />
          <div className="flex-1">
            <div className="text-[14px] font-semibold">Deal with {c.them}</div>
            <div className="text-[11px] text-muted">Found by {c.wakil} · 6 of 10 messages</div>
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-[44px] font-extrabold leading-none tracking-[-0.03em]">RM{amount}</span>
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
