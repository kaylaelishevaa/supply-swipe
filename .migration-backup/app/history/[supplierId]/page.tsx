"use client";
// B3 History and renegotiate: past weeks with Ayam Segar, trust between the two businesses,
// and "Renegotiate with memory" when the price moves (the burden is recurring).

import Link from "next/link";
import { useRouter } from "next/navigation";
import * as api from "@/lib/api";
import { useDemo } from "@/lib/demo-context";
import { LOGO, NEGOTIATION_ID } from "@/lib/mock";
import { Screen } from "@/components/Screen";
import { StatusBar } from "@/components/StatusBar";
import { BusinessLogo } from "@/components/BusinessLogo";
import { Wakil } from "@/components/Wakil";
import { Button } from "@/components/Button";
import { ChevronLeft } from "@/components/Icons";
import { HistoryRow } from "@/components/HistoryRow";
import { TabBar } from "@/components/TabBar";

export default function HistoryPage() {
  const router = useRouter();
  const { role } = useDemo();

  const renegotiate = async () => {
    await api.log({
      side: "buyer",
      kind: "human",
      staffVisible: role === "staff",
      action: "Renegotiate with memory · Ayam Segar",
      actor: role === "owner" ? "Mak Ngah · owner" : "Aisyah · kitchen lead",
      reason: "List moved to RM13.10/kg, market RM12.40",
    });
    router.push(`/negotiation/${NEGOTIATION_ID}`);
  };

  return (
    <Screen>
      <StatusBar />
      <div className="flex flex-none items-center gap-2.5 px-4 pb-3.5 pt-1">
        <Link
          href="/feed"
          className="flex h-8 w-8 items-center justify-center rounded-full border border-line bg-white shadow-card"
          aria-label="Back to feed"
        >
          <ChevronLeft size={16} />
        </Link>
        <BusinessLogo src={LOGO.ayamSegar} name="Ayam Segar Enterprise" size={40} />
        <div>
          <div className="text-[20px] font-extrabold tracking-[-0.02em]">Ayam Segar</div>
          <div className="text-[12px] text-muted">Chicken breast · since 22 Oct</div>
        </div>
      </div>
      <div className="no-scrollbar flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-4">
        <div className="flex flex-col gap-2.5 rounded-[14px] border-[1.5px] border-amber bg-white p-3.5">
          <div className="flex items-center justify-between">
            <span className="text-[14px] font-semibold">Week 3</span>
            <span className="flex h-[22px] items-center whitespace-nowrap rounded-full bg-amber-soft px-2 text-[11px] font-semibold text-amber-text">Price moved</span>
          </div>
          <div className="text-[13px] leading-[1.5]">Ayam Segar raised list to RM13.10/kg. Market is now RM12.40.</div>
          <Button variant="wakil" height={48} fontSize={14} onClick={renegotiate}>
            <Wakil side="buyer" width={34} height={38} turn={-20} bust className="-my-1.5" />
            Renegotiate with memory
          </Button>
          <div className="text-[11px] leading-[1.45] text-purple-text">
            Memory: &quot;Ayam Segar takes 7-day terms. 3 of 3 drops on time. Moves RM0.30 for a standing order.&quot;
          </div>
        </div>
        <div className="rounded-[21px] bg-white px-3.5 py-1 shadow-card">
          <HistoryRow week="Week 2" note="Renewed · 4 messages" price="RM12.20" />
          <HistoryRow week="Week 1" note="2-week trial · 6 messages" price="RM12.30" last />
        </div>
        <div className="mt-1 text-[12px] font-semibold">Trust between you</div>
        <div className="grid grid-cols-3 gap-2">
          {[
            ["Deliveries", "3 of 3"],
            ["Payments", "3 of 3"],
          ].map(([l, v]) => (
            <div key={l} className="rounded-[12px] bg-teal-soft p-2.5 text-teal-text">
              <div className="text-[11px]">{l}</div>
              <div className="mt-0.5 text-[16px] font-semibold">{v}</div>
              <div className="text-[11px]">on time</div>
            </div>
          ))}
          <div className="rounded-[20px] bg-white p-2.5 shadow-card">
            <div className="text-[11px] text-muted">Disputes</div>
            <div className="mt-0.5 text-[16px] font-semibold">0</div>
            <div className="text-[11px] text-muted">so far</div>
          </div>
        </div>
      </div>
      <div className="flex-none px-4 pb-3 pt-4">
        <Button variant="secondary" height={48} onClick={() => router.push("/feed")}>
          Find alternatives
        </Button>
      </div>
      <TabBar active="deals" />
    </Screen>
  );
}
