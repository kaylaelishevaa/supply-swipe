"use client";
// N1 Notification (demo-only lock screen): one notification per deal for the owner.
// "Review deal" opens the owner's approval sheet. Nothing happens until the owner taps.

/* eslint-disable @next/next/no-img-element */
import { useRouter } from "@/lib/navigation";
import * as api from "@/lib/api";
import { useApi } from "@/lib/useApi";
import { useDemo } from "@/lib/demo-context";
import { DEAL_ID } from "@/lib/mock";
import { rm, rmTotal } from "@/lib/negotiation";

export default function NotifyPage() {
  const router = useRouter();
  const { setSide, setRole } = useDemo();
  const deal = useApi(() => api.getDeal(DEAL_ID), []);
  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden bg-[#DCD9F0] text-ink tabular-nums">
      <div className="absolute left-[-120px] top-[420px] h-[520px] w-[520px] rounded-full bg-[#C9C3F2] opacity-70" />
      <div className="absolute right-[-160px] top-[-60px] h-[420px] w-[420px] rounded-full bg-[#E7E4F8]" />
      <div className="relative flex h-11 flex-none items-center justify-between px-6 text-[13px] font-semibold">
        <span>Celcom</span>
        <span className="font-normal">5G · 82%</span>
      </div>
      <div className="relative flex flex-none flex-col items-center pt-7">
        <svg width="14" height="16" viewBox="0 0 10 11" aria-hidden>
          <rect x="1" y="4.5" width="8" height="6" rx="1.5" fill="#1D1B2E" />
          <path d="M3 4.5V3a2 2 0 0 1 4 0v1.5" fill="none" stroke="#1D1B2E" strokeWidth="1.3" />
        </svg>
        <div className="mt-2.5 text-[15px] font-semibold">Wednesday, 22 October</div>
        <div className="text-[88px] font-extrabold leading-none tracking-[-0.04em]">9:06</div>
      </div>
      <div className="relative flex flex-1 flex-col gap-2 px-3 pt-9">
        <div className="flex flex-col gap-2.5 rounded-[26px] bg-white/[0.86] p-3.5 shadow-[0_18px_40px_rgba(60,55,120,0.18)]">
          <div className="flex items-center gap-2">
            <img src="/logos/supplyswipe-icon.png" alt="SupplySwipe" className="h-[22px] w-[22px] rounded-[6px] shadow-[0_1px_3px_rgba(0,0,0,0.15)]" />
            <span className="text-[12px] font-semibold tracking-[0.02em]">SUPPLYSWIPE</span>
            <span className="flex-1" />
            <span className="text-[12px] text-muted">now</span>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex-1">
              <div className="text-[15px] font-extrabold tracking-[-0.01em]">{deal ? `${api.wakilName(deal.buyerId)} found a deal` : ""}</div>
              <div className="mt-0.5 text-[14px] leading-[1.4]">
                {deal ? api.parties(deal).supplier.short : ""} · chicken breast {deal ? `${rm(deal.terms.pricePerKg)}/kg` : ""} ·{" "}
                <span className="font-semibold">{deal ? `${rmTotal(deal.terms.weeklyTotal)} per week` : ""}</span>. Tap to approve or counter.
              </div>
            </div>
            {deal && <img src={api.parties(deal).supplier.logo} alt={api.parties(deal).supplier.short} className="h-11 w-11 flex-none object-contain" />}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                setSide("buyer");
                setRole("owner");
                router.push(`/approve/${DEAL_ID}`);
              }}
              className="flex h-10 items-center justify-center rounded-full bg-ink text-[13px] font-semibold text-white"
            >
              Review deal
            </button>
            <button onClick={() => router.push("/feed")} className="flex h-10 items-center justify-center rounded-full bg-ink/[0.06] text-[13px] font-semibold">
              Later
            </button>
          </div>
        </div>
        <div className="mx-2.5 h-3 rounded-b-[20px] bg-white/55" />
        <div className="flex items-center gap-2.5 rounded-[22px] bg-white/60 px-3.5 py-3">
          <img src="/logos/supplyswipe-icon.png" alt="" className="h-[30px] w-[30px] rounded-[8px]" />
          <div className="min-w-0 flex-1">
            <div className="text-[13px] font-semibold">Aisyah posted a request</div>
            <div className="truncate text-[12px] text-[#4E4C66]">50 kg chicken breast · Mon and Thu · 3 suppliers fit</div>
          </div>
          <span className="text-[11px] text-muted">9:02</span>
        </div>
      </div>
      <div className="relative flex flex-none flex-col items-center gap-3.5 pb-[18px]">
        <div className="text-[12px] text-[#4E4C66]">One notification per deal. Nothing happens until you tap.</div>
        <div className="h-[5px] w-[134px] rounded-[3px] bg-ink" />
      </div>
    </div>
  );
}
