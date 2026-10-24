"use client";
// S5 Deal and chat: pinned terms (locked) at the top, a plain chat between the two businesses below.
// Messages here never change the agreed terms. Renegotiate goes back through the Wakils.

import { Link } from "wouter";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "@/lib/navigation";
import * as api from "@/lib/api";
import { useApi } from "@/lib/useApi";
import { useDemo } from "@/lib/demo-context";
import type { Deal } from "@/lib/types";
import { Screen } from "@/components/Screen";
import { StatusBar } from "@/components/StatusBar";
import { BusinessLogo } from "@/components/BusinessLogo";
import { Button } from "@/components/Button";
import { ChevronLeft } from "@/components/Icons";
import { PinnedTerms } from "@/components/PinnedTerms";
import { ChatThread, type ChatMsg } from "@/components/ChatThread";
import { Composer } from "@/components/Composer";

const DAY_NAMES: Record<string, string> = { Mon: "Monday", Tue: "Tuesday", Wed: "Wednesday", Thu: "Thursday", Fri: "Friday", Sat: "Saturday" };

/** The first few chat messages after a deal, between the two owners (seen from the buyer's side). */
function seedChat(deal: Deal): ChatMsg[] {
  const buyerOwner = api.people(deal, "buyer").owner;
  const supplierOwner = api.people(deal, "supplier").owner;
  const firstDay = DAY_NAMES[deal.terms.days[0]] ?? deal.terms.days[0];
  return [
    { id: "c1", mine: false, text: `Terima kasih boss. First drop ${firstDay} 7.30am, driver is Hafiz.`, by: supplierOwner, at: "10:14" },
    { id: "c2", mine: true, text: "Ok. Use the back door at the lane, kitchen opens 7am.", by: buyerOwner, at: "10:16" },
    { id: "c3", mine: false, text: "Noted. Invoice will match the pinned terms.", by: supplierOwner, at: "10:17" },
  ];
}

export default function DealPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { side, role } = useDemo();
  const deal = useApi(() => api.getDeal(params.id), [params.id]);
  // Chat is seen from the buyer's side in the reference; the supplier sees the mirror.
  const [sent, setSent] = useState<ChatMsg[]>([]);
  const msgs = deal ? [...seedChat(deal), ...sent] : sent;
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [msgs.length]);

  const buyer = side === "buyer";
  const thread = buyer ? msgs : msgs.map((m) => ({ ...m, mine: !m.mine }));
  const me = deal ? api.people(deal, side) : null;
  const myName = me ? (role === "owner" ? me.owner : me.staff) : "";
  const them = deal ? api.parties(deal)[buyer ? "supplier" : "buyer"] : null;

  const send = (text: string) => {
    const d = new Date();
    const at = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
    setSent((m) => [...m, { id: `c${Date.now()}`, mine: buyer, text, by: myName, at }]);
  };

  return (
    <Screen>
      <StatusBar />
      <div className="flex flex-none items-center gap-2.5 px-4 pb-3 pt-1">
        <Link
          href="/feed"
          className="flex h-8 w-8 items-center justify-center rounded-full border border-line bg-white shadow-card"
          aria-label="Back to feed"
        >
          <ChevronLeft size={16} />
        </Link>
        {them && <BusinessLogo src={them.logo} name={them.name} size={36} />}
        <div className="flex-1">
          <div className="text-[16px] font-semibold">{them?.name}</div>
          <div className="text-[11px] text-muted">{them ? `${them.owner} · owner` : ""}</div>
        </div>
      </div>

      {deal && deal.status !== "sealed" && (
        <Link
          href={`/approve/${deal.id}`}
          className="mx-4 mb-2.5 flex flex-none items-center gap-2 rounded-[14px] bg-amber-soft px-3 py-2.5 text-[12px] font-semibold text-amber-text"
        >
          <span className="h-2 w-2 flex-none rounded-full bg-amber" />
          <span className="flex-1">Waiting for both owners to approve</span>
          <span>Review</span>
        </Link>
      )}

      {deal && (
        <div className="mx-4 flex-none">
          <PinnedTerms
            deal={deal}
            actions={
              <>
                <Button variant="secondary" height={40} onClick={() => router.push(`/history/${deal.supplierId}`)}>
                  Renegotiate
                </Button>
                <Button variant="secondary" height={40} onClick={() => router.push("/log")}>
                  View log
                </Button>
              </>
            }
          />
          {buyer && (
            <Link href={`/deal/${deal.id}/invoice`} className="mt-2 flex items-center justify-between px-1 text-[12px]">
              <span className="text-muted">
                <span className="font-mono text-[11px]">INV-8841</span> · week of 27 Oct
              </span>
              <span className="font-semibold text-coral-text">Check invoice</span>
            </Link>
          )}
        </div>
      )}

      <div ref={scrollRef} className="no-scrollbar flex min-h-0 flex-1 flex-col gap-2.5 overflow-y-auto px-4 py-3.5">
        <div className="flex-1" />
        <div className="max-w-[290px] self-center text-center text-[11px] leading-[1.45] text-muted">
          Messages here never change the agreed terms. Tap Renegotiate to change them.
        </div>
        <ChatThread messages={thread} />
      </div>

      <Composer placeholder={them ? `Message ${them.short}` : "Message"} onSend={send} />
    </Screen>
  );
}
