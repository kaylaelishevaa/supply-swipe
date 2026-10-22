"use client";
// S4b Counter via Wakil: the owner types one line, the same Wakil resumes the same negotiation
// for at most 4 more messages. The note guides wording only; the sealed limit still holds.

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import * as api from "@/lib/api";
import { useApi } from "@/lib/useApi";
import { useDemo } from "@/lib/demo-context";
import { NEGOTIATION_ID } from "@/lib/mock";
import { Screen } from "@/components/Screen";
import { StatusBar } from "@/components/StatusBar";
import { Wakil } from "@/components/Wakil";
import { Button } from "@/components/Button";
import { LockIcon } from "@/components/Icons";
import type { WakilPose } from "@/components/WakilAvatar";

const IDEAS = ["Try RM12.00", "Ask for 14-day terms", "Commit 8 weeks", "Deliver by 8am"];
const SEGS = ["#6A5CF0", "#0E8A76", "#6A5CF0", "#0E8A76", "#6A5CF0", "#0E8A76", "#C9C3F2", "#C9C3F2", "#C9C3F2", "#C9C3F2"];

export default function CounterPage({ params }: { params: { id: string } }) {
  const { side, role } = useDemo();
  const own = useApi(() => api.getOwnLimit(side), [side]);
  const [text, setText] = useState("Try RM12.00 if we commit for 8 weeks");
  const [sent, setSent] = useState(false);
  const [pose, setPose] = useState<WakilPose>("idle");
  const t = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => () => clearTimeout(t.current), []);

  const send = async () => {
    if (sent || !text.trim()) return;
    setSent(true);
    setPose("speak");
    clearTimeout(t.current);
    t.current = setTimeout(() => setPose("idle"), 2200);
    await api.counterViaWakil(params.id, side, role, text.trim());
  };

  const buyer = side === "buyer";
  return (
    <Screen>
      <StatusBar />
      <div className="px-4 pt-1">
        <div className="text-[12px] font-semibold text-amber-text">Deal waiting for you</div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-[36px] font-extrabold tracking-[-0.03em]">RM610</span>
          <span className="text-[13px] text-muted">per week</span>
        </div>
        <div className="text-[13px] text-muted">RM12.20/kg · 50 kg Mon and Thu · 7-day terms</div>
      </div>
      <div className="absolute inset-0 bg-overlay" />
      <div className="absolute inset-x-0 bottom-0 flex flex-col gap-3.5 rounded-t-[32px] bg-bg px-4 pb-[30px] pt-2.5">
        <div className="h-[5px] w-10 self-center rounded-[3px] bg-[#D4D1E4]" />
        <div className="flex items-center gap-1.5">
          <Wakil side={side} width={76} height={80} pose={pose} turn={-16} bust style={{ margin: "-10px -4px -6px -10px" }} />
          <div className="flex-1">
            <div className="text-[20px] font-extrabold tracking-[-0.02em]">Counter via Wakil</div>
            <div className="text-[12px] text-muted">Tell it one thing. It picks up the same chat.</div>
          </div>
        </div>
        <textarea
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setSent(false);
          }}
          placeholder="e.g. Try RM12.00 if we commit for 8 weeks"
          className="min-h-[92px] resize-none rounded-[22px] bg-white px-4 py-3.5 text-[15px] leading-[1.5] text-ink shadow-card outline-none placeholder:text-muted"
        />
        <div className="flex flex-wrap gap-1.5">
          {IDEAS.map((label) => (
            <button
              key={label}
              onClick={() => {
                setText(label);
                setSent(false);
              }}
              className="flex h-[30px] items-center whitespace-nowrap rounded-full bg-white px-3 text-[12px] font-semibold shadow-[0_4px_10px_rgba(60,55,120,0.08)]"
            >
              {label}
            </button>
          ))}
        </div>
        <div className="flex flex-col gap-2 rounded-[22px] bg-white px-3.5 py-3 shadow-card">
          <div className="flex justify-between text-[12px]">
            <span className="text-muted">Messages left</span>
            <span className="font-semibold">up to 4 more</span>
          </div>
          <div className="grid grid-cols-10 gap-[3px]">
            {SEGS.map((c, i) => (
              <span key={i} className="h-[5px] rounded-[3px]" style={{ background: c }} />
            ))}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-purple-text">
            <LockIcon />
            {own != null &&
              (buyer
                ? `Your max RM${own.toFixed(2)} stays sealed. If your note asks for more, Wakil tells you instead.`
                : `Your floor RM${own.toFixed(2)} stays sealed. If your note asks for less, Wakil tells you instead.`)}
          </div>
        </div>
        <Button variant="wakil" height={54} onClick={send}>
          {sent ? "Sent · Wakil is negotiating" : "Send to Wakil"}
        </Button>
        {sent ? (
          <Link href={`/negotiation/${NEGOTIATION_ID}`} className="text-center text-[12px] font-semibold text-purple-text">
            Back to the negotiation
          </Link>
        ) : (
          <div className="text-center text-[12px] text-muted">
            {buyer ? "Ayam Segar's owner sees the new offer, not your note." : "Mak Ngah sees the new offer, not your note."}
          </div>
        )}
      </div>
    </Screen>
  );
}
