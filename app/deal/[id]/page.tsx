"use client";
// S5 Deal and chat: pinned terms (locked) at the top, a plain chat between the two businesses below.
// Messages here never change the agreed terms. Renegotiate goes back through the Wakils.

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import * as api from "@/lib/api";
import { useApi } from "@/lib/useApi";
import { useDemo } from "@/lib/demo-context";
import { LOGO } from "@/lib/mock";
import { Screen } from "@/components/Screen";
import { StatusBar } from "@/components/StatusBar";
import { BusinessLogo } from "@/components/BusinessLogo";
import { Button } from "@/components/Button";
import { PinnedTerms } from "@/components/PinnedTerms";
import { ChatThread, type ChatMsg } from "@/components/ChatThread";
import { Composer } from "@/components/Composer";

const SEED: ChatMsg[] = [
  { id: "c1", mine: false, text: "Terima kasih boss. First drop Monday 7.30am, driver is Hafiz.", by: "Encik Roslan", at: "10:14" },
  { id: "c2", mine: true, text: "Ok. Use the back door at the lane, kitchen opens 7am.", by: "Mak Ngah", at: "10:16" },
  { id: "c3", mine: false, text: "Noted. Invoice will match the pinned terms.", by: "Encik Roslan", at: "10:17" },
];

export default function DealPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { side, role } = useDemo();
  const deal = useApi(() => api.getDeal(params.id), [params.id]);
  // Chat is seen from the buyer's side in the reference; the supplier sees the mirror.
  const [msgs, setMsgs] = useState<ChatMsg[]>(SEED);
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [msgs.length]);

  const buyer = side === "buyer";
  const thread = buyer ? msgs : msgs.map((m) => ({ ...m, mine: !m.mine }));
  const myName = buyer ? (role === "owner" ? "Mak Ngah" : "Aisyah") : role === "owner" ? "Encik Roslan" : "Sales rep";

  const send = (text: string) => {
    const d = new Date();
    const at = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
    setMsgs((m) => [...m, { id: `c${Date.now()}`, mine: buyer, text, by: myName, at }]);
  };

  return (
    <Screen>
      <StatusBar />
      <div className="flex flex-none items-center gap-2.5 px-4 pb-3 pt-1">
        <BusinessLogo src={buyer ? LOGO.ayamSegar : LOGO.makNgah} name={buyer ? "Ayam Segar Enterprise" : "Restoran Mak Ngah"} size={36} />
        <div className="flex-1">
          <div className="text-[16px] font-semibold">{buyer ? "Ayam Segar Enterprise" : "Restoran Mak Ngah"}</div>
          <div className="text-[11px] text-muted">{buyer ? "Encik Roslan · owner" : "Mak Ngah · owner"}</div>
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
                <Button variant="secondary" height={40} onClick={() => router.push("/history/ayam-segar")}>
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

      <Composer placeholder={buyer ? "Message Ayam Segar" : "Message Mak Ngah"} onSend={send} />
    </Screen>
  );
}
