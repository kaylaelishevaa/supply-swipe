"use client";
// S7 No deal: the other side's limit and yours don't overlap, so the Wakils stop at once (0 tokens).
// Shows their public price against your own sealed limit, what would close it, and who fits instead.
// The other side's sealed limit is never shown.

import { Link } from "wouter";
import { useState } from "react";
import { useRouter } from "@/lib/navigation";
import * as api from "@/lib/api";
import { useApi } from "@/lib/useApi";
import { useDemo } from "@/lib/demo-context";
import { rm } from "@/lib/negotiation";
import { Screen } from "@/components/Screen";
import { StatusBar } from "@/components/StatusBar";
import { Button } from "@/components/Button";
import { BusinessLogo } from "@/components/BusinessLogo";
import { GapCard } from "@/components/GapCard";

export default function NoDealPage() {
  const router = useRouter();
  const { role } = useDemo();
  const [done, setDone] = useState<null | "retry" | "chat">(null);
  const nd = useApi(() => Promise.resolve(api.getNoDeal()), []);
  if (!nd) return <Screen>{null}</Screen>;

  const buyer = nd.side === "buyer";
  const me = api.business(buyer ? "mak-ngah" : "ayam-segar");
  const actor = buyer ? (role === "owner" ? "Mak Ngah · owner" : "Aisyah · kitchen lead") : role === "owner" ? "Encik Roslan · owner, Ayam Segar" : "Sales rep · Ayam Segar";
  const them = nd.counterpart;

  const retry = async () => {
    await api.log({ side: nd.side, kind: "human", staffVisible: role === "staff", action: `Retried ${them.short} with 14-day terms`, actor, reason: "Longer terms may move the price. Limits stay sealed." });
    setDone("retry");
  };
  const requestChat = async () => {
    await api.log({ side: nd.side, kind: "human", staffVisible: role === "staff", action: `Requested a chat with ${them.name}`, actor, reason: "No deal on price. Limits stay sealed." });
    setDone("chat");
  };

  return (
    <Screen>
      <StatusBar />
      <div className="flex-none px-4 pb-3.5 pt-1">
        <div className="text-[22px] font-extrabold tracking-[-0.02em]">No deal with {them.name}</div>
        <div className="mt-0.5 text-[12px] text-muted">Chicken breast · stopped before the first message</div>
      </div>
      <div className="no-scrollbar flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-4">
        <GapCard
          theirs={rm(nd.theirsPerKg)}
          ours={rm(nd.ownPerKg)}
          note={`${buyer ? "Their list price" : "Their target"} against your sealed ${buyer ? "maximum" : "floor"}. Their limit and yours don't overlap, so the Wakils never started. Neither limit was shown. 0 tokens used.`}
        />
        <div className="flex flex-col gap-2 rounded-[21px] bg-white p-3.5 shadow-card">
          <div className="text-[14px] font-semibold">What would close it</div>
          <div className="text-[13px] leading-[1.5]">
            {buyer ? "Raise your maximum" : "Lower your floor"}, or offer different terms such as 14-day payment; some {buyer ? "suppliers" : "buyers"} move on price for longer terms.
          </div>
          {done ? (
            <div className="mt-1 flex items-center gap-2 rounded-[14px] bg-purple-soft px-3 py-2.5 text-[12px] font-semibold text-purple-text">
              <span className="h-2 w-2 flex-none rounded-full bg-purple" />
              {done === "retry" ? `Sent · ${api.wakilName(me.id)} is retrying with 14-day terms` : `Chat requested · ${them.short} gets one notification`}
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
        <div className="mt-1 text-[12px] font-semibold">{buyer ? "Suppliers" : "Buyers"} who fit instead</div>
        {nd.others.slice(0, 2).map((c) => (
          <Link key={c.id} href="/feed" className="flex items-center gap-3 rounded-[21px] bg-white p-3 shadow-card">
            <BusinessLogo src={c.logo} name={c.name} size={40} />
            <div className="flex-1">
              <div className="text-[14px] font-semibold">{c.name}</div>
              <div className="text-[11px] text-muted">
                {c.listLabel} · {c.why}
              </div>
            </div>
            <div className="text-[16px] font-semibold text-teal-text">{c.fit}%</div>
          </Link>
        ))}
      </div>
      <div className="flex-none px-4 pb-8 pt-4">
        <Button variant="secondary" height={48} onClick={() => router.push("/feed")}>
          Back to feed
        </Button>
      </div>
    </Screen>
  );
}
