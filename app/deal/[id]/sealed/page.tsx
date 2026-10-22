"use client";
// S8 Deal sealed: both Wakils celebrate, locked terms with both approvals (who, role, time),
// and the Orbyte sync card. Only shown as sealed once both sides have approved.

import Link from "next/link";
import * as api from "@/lib/api";
import { useApi } from "@/lib/useApi";
import type { Approval } from "@/lib/types";
import { Screen } from "@/components/Screen";
import { StatusBar } from "@/components/StatusBar";
import { Wakil } from "@/components/Wakil";
import { BusinessLogo } from "@/components/BusinessLogo";

const BIZ = {
  buyer: { name: "Restoran Mak Ngah", logo: "/logos/mak-ngah.png" },
  supplier: { name: "Ayam Segar Enterprise", logo: "/logos/ayam-segar.png" },
};
const ROLE_LABEL = { buyer: { owner: "owner", staff: "kitchen lead" }, supplier: { owner: "owner", staff: "sales rep" } };

function ApprovalRow({ a }: { a: Approval }) {
  const b = BIZ[a.side];
  return (
    <div className="flex items-center gap-2.5">
      <BusinessLogo src={b.logo} name={b.name} size={36} />
      <div className="flex-1">
        <div className="text-[13px] font-semibold">
          {a.by} · {ROLE_LABEL[a.side][a.role]}
        </div>
        <div className="text-[11px] text-muted">{b.name}</div>
      </div>
      <div className="text-right">
        <div className="text-[12px] font-semibold text-teal-text">Approved</div>
        <div className="text-[11px] text-muted">{a.at}</div>
      </div>
    </div>
  );
}

export default function SealedPage({ params }: { params: { id: string } }) {
  const deal = useApi(() => api.getDeal(params.id), [params.id]);
  if (!deal) return <Screen>{null}</Screen>;

  if (deal.status !== "sealed") {
    return (
      <Screen>
        <StatusBar />
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-8 text-center">
          <div className="text-[22px] font-extrabold tracking-[-0.02em]">Not sealed yet</div>
          <div className="text-[13px] leading-[1.45] text-muted">A deal is created only when both owners approve. {deal.approvals.length} of 2 approvals so far.</div>
          <Link href={`/approve/${deal.id}`} className="mt-2 flex h-12 w-full items-center justify-center rounded-full bg-ink text-[14px] font-semibold text-white shadow-ink">
            Go to approval
          </Link>
        </div>
      </Screen>
    );
  }

  const ordered = [...deal.approvals].sort((x, y) => (x.side === y.side ? 0 : x.side === "buyer" ? -1 : 1));
  return (
    <Screen>
      <StatusBar />
      <div className="relative h-[250px] flex-none">
        <div className="absolute left-1/2 top-10 -ml-[150px] h-[200px] w-[300px] rounded-full bg-teal-soft" />
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-center">
          <Wakil side="buyer" width={170} height={230} pose="happy" turn={30} />
          <Wakil side="supplier" width={170} height={230} pose="happy" turn={-30} style={{ marginLeft: -40 }} />
        </div>
      </div>
      <div className="flex-none px-5 pt-1.5 text-center">
        <div className="text-[30px] font-extrabold tracking-[-0.03em]">Deal sealed</div>
        <div className="mt-1 text-[13px] text-muted">Both owners approved. Terms are now locked.</div>
      </div>
      <div className="mx-4 mt-4 flex flex-none flex-col gap-3 rounded-[28px] bg-white p-4 shadow-hero">
        <div className="flex items-baseline justify-between">
          <span className="text-[24px] font-extrabold tracking-[-0.02em]">RM{deal.terms.pricePerKg.toFixed(2)}/kg</span>
          <span className="whitespace-nowrap text-[13px] text-muted">RM{deal.terms.weeklyTotal} per week</span>
        </div>
        <div className="text-[12px] leading-[1.5] text-muted">50 kg Mon and Thu before 9am · free delivery above 40 kg · 7-day terms · 2-week trial from 27 Oct</div>
        <div className="h-px bg-line" />
        {ordered.map((a) => (
          <ApprovalRow key={a.side} a={a} />
        ))}
      </div>
      <div className="mx-4 mt-2.5 flex flex-none items-center gap-3 rounded-[22px] bg-white px-3.5 py-3 shadow-card">
        <div className="flex h-[38px] w-[38px] flex-none items-center justify-center rounded-[12px] bg-ink text-[13px] font-extrabold text-white">O</div>
        <div className="min-w-0 flex-1">
          <div className="text-[13px] font-semibold">Saved to Orbyte</div>
          <div className="mt-0.5 whitespace-nowrap font-mono text-[10px] text-muted">{deal.poNumber ?? "PO-2210-0142"} · Connect → accounting</div>
        </div>
        <span className="flex h-6 items-center whitespace-nowrap rounded-full bg-teal-soft px-2.5 text-[11px] font-semibold text-teal-text">Synced</span>
      </div>
      <div className="flex-1" />
      <div className="grid flex-none grid-cols-2 gap-2 px-4 pb-[30px] pt-3">
        <Link href="/log" className="flex h-[52px] items-center justify-center rounded-full bg-white text-[14px] font-semibold shadow-ctl">
          View log
        </Link>
        <Link href={`/deal/${deal.id}`} className="flex h-[52px] items-center justify-center rounded-full bg-ink text-[14px] font-semibold text-white shadow-ink">
          Open deal chat
        </Link>
      </div>
    </Screen>
  );
}
