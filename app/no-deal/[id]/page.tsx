"use client";
// S7 No deal: the floor is above the maximum, so the Wakils stop at once (0 tokens).
// Shows the gap, what would close it, and suppliers who fit instead. Limits are never shown.

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import * as api from "@/lib/api";
import { useDemo } from "@/lib/demo-context";
import { LOGO } from "@/lib/mock";
import { Screen } from "@/components/Screen";
import { StatusBar } from "@/components/StatusBar";
import { Button } from "@/components/Button";
import { BusinessLogo } from "@/components/BusinessLogo";
import { GapCard } from "@/components/GapCard";

export default function NoDealPage() {
  const router = useRouter();
  const { role } = useDemo();
  const [done, setDone] = useState<null | "retry" | "chat">(null);
  const actor = role === "owner" ? "Mak Ngah · owner" : "Aisyah · kitchen lead";

  const retry = async () => {
    await api.log({ side: "buyer", kind: "human", staffVisible: role === "staff", action: "Retried Fresh Poultry with 14-day terms", actor, reason: "Supplier moves on price for longer terms" });
    setDone("retry");
  };
  const requestChat = async () => {
    await api.log({ side: "buyer", kind: "human", staffVisible: role === "staff", action: "Requested a chat with Fresh Poultry Puchong", actor, reason: "No deal on price. Limits stay sealed." });
    setDone("chat");
  };

  return (
    <Screen>
      <StatusBar />
      <div className="flex-none px-4 pb-3.5 pt-1">
        <div className="text-[22px] font-extrabold tracking-[-0.02em]">No deal with Fresh Poultry Puchong</div>
        <div className="mt-0.5 text-[12px] text-muted">Chicken breast · 50 kg weekly · ended after 1 message</div>
      </div>
      <div className="no-scrollbar flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-4">
        <GapCard theirs="RM13.80" ours="RM12.90" note="Their floor is above your maximum. Your limits were never shown. 0 tokens used." />
        <div className="flex flex-col gap-2 rounded-[21px] bg-white p-3.5 shadow-card">
          <div className="text-[14px] font-semibold">What would close it</div>
          <div className="text-[13px] leading-[1.5]">
            Raise your maximum by RM0.90/kg, or offer 14-day terms; this supplier moves on price for longer terms.
          </div>
          {done ? (
            <div className="mt-1 flex items-center gap-2 rounded-[14px] bg-purple-soft px-3 py-2.5 text-[12px] font-semibold text-purple-text">
              <span className="h-2 w-2 flex-none rounded-full bg-purple" />
              {done === "retry"
                ? "Sent · Wakil Mak Ngah is retrying with 14-day terms"
                : "Chat requested · Fresh Poultry gets one notification"}
            </div>
          ) : (
            <div className="mt-1 grid grid-cols-2 gap-2">
              <Button variant="wakil" height={44} onClick={retry}>
                Retry with 14 days
              </Button>
              <Button variant="secondary" height={44} onClick={requestChat}>
                Request to chat
              </Button>
            </div>
          )}
        </div>
        <div className="mt-1 text-[12px] font-semibold">Suppliers who fit instead</div>
        <Link href="/feed" className="flex items-center gap-3 rounded-[21px] bg-white p-3 shadow-card">
          <BusinessLogo src={LOGO.ayamSegar} name="Ayam Segar Enterprise" size={40} />
          <div className="flex-1">
            <div className="text-[14px] font-semibold">Ayam Segar Enterprise</div>
            <div className="text-[11px] text-muted">List RM12.80 · delivers PJ Mon–Sat</div>
          </div>
          <div className="text-[16px] font-semibold text-teal-text">92%</div>
        </Link>
        <Link href="/feed" className="flex items-center gap-3 rounded-[21px] bg-white p-3 shadow-card">
          <BusinessLogo src={LOGO.kampungPoultry} name="Kampung Poultry KL" size={40} />
          <div className="flex-1">
            <div className="text-[14px] font-semibold">Kampung Poultry KL</div>
            <div className="text-[11px] text-amber-text">Tue and Fri only</div>
          </div>
          <div className="text-[16px] font-semibold">81%</div>
        </Link>
      </div>
      <div className="flex-none px-4 pb-8 pt-4">
        <Button variant="secondary" height={48} onClick={() => router.push("/feed")}>
          Back to feed
        </Button>
      </div>
    </Screen>
  );
}
