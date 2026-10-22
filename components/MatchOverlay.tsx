"use client";
// "Wakil sedang nego" overlay shown after a right swipe: both agents, Watch live / Keep swiping.

import { useEffect, useState } from "react";
import type { Side } from "@/lib/types";
import { Wakil } from "./Wakil";

export function MatchOverlay({
  side,
  counterpartName,
  onWatch,
  onClose,
}: {
  side: Side;
  counterpartName: string;
  onWatch: () => void;
  onClose: () => void;
}) {
  // Fade in over .3s after mount.
  const [on, setOn] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setOn(true), 40);
    return () => clearTimeout(t);
  }, []);
  const own = side === "buyer" ? "Wakil Mak Ngah" : "Wakil Ayam Segar";

  return (
    <div
      className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-[18px] p-8 text-center"
      style={{ background: "rgba(246,246,242,0.96)", opacity: on ? 1 : 0, transition: "opacity .3s" }}
      role="dialog"
      aria-label="Wakil sedang nego"
    >
      <div className="flex h-[200px] w-full items-end justify-center">
        <Wakil side="buyer" width={160} height={200} pose="speak" turn={38} />
        <Wakil side="supplier" width={160} height={200} pose="speak" turn={-38} style={{ marginLeft: -24 }} />
      </div>
      <div className="text-[30px] font-semibold tracking-[-0.01em]">Wakil sedang nego</div>
      <div className="max-w-[280px] text-[14px] leading-[1.5] text-muted">
        {own} is negotiating with {counterpartName}. Limits sealed on both sides. You approve the result.
      </div>
      <div className="mt-2 flex w-full flex-col gap-2.5">
        <button onClick={onWatch} className="flex h-[50px] items-center justify-center rounded-full bg-purple text-[15px] font-semibold text-white">
          Watch live
        </button>
        <button onClick={onClose} className="flex h-[46px] items-center justify-center rounded-full bg-white text-[14px] font-semibold shadow-ctl">
          Keep swiping
        </button>
      </div>
    </div>
  );
}
