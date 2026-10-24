"use client";
// Buttons under the swipe deck: Undo (46, amber) · Skip (66, coral X) · Flip (46) · Nego (66, purple, own logo).

/* eslint-disable @next/next/no-img-element */
import { UndoIcon, XIcon } from "./Icons";

export function SwipeActions({
  ownLogo,
  onUndo,
  onSkip,
  onFlip,
  onNego,
}: {
  ownLogo: string;
  onUndo: () => void;
  onSkip: () => void;
  onFlip: () => void;
  onNego: () => void;
}) {
  return (
    <div className="flex h-[104px] flex-none items-center justify-center gap-[18px]">
      <button
        onClick={onUndo}
        aria-label="Undo"
        className="flex h-[46px] w-[46px] items-center justify-center rounded-full bg-white shadow-[0_4px_14px_rgba(60,55,120,0.1)] active:scale-95"
      >
        <UndoIcon />
      </button>
      <button
        onClick={onSkip}
        aria-label="Skip"
        className="flex h-[66px] w-[66px] items-center justify-center rounded-full bg-white shadow-[0_6px_18px_rgba(60,55,120,0.12)] active:scale-95"
      >
        <XIcon />
      </button>
      <button
        onClick={onFlip}
        aria-label="Flip card"
        className="flex h-[46px] w-[46px] items-center justify-center rounded-full bg-white text-[10px] font-semibold text-purple-text shadow-[0_4px_14px_rgba(60,55,120,0.1)] active:scale-95"
      >
        Flip
      </button>
      <button
        onClick={onNego}
        aria-label="Send Wakil to negotiate"
        className="flex h-[66px] w-[66px] flex-col items-center justify-center rounded-full bg-purple text-white shadow-[0_8px_20px_rgba(90,79,207,0.35)] active:scale-95"
      >
        <img src={ownLogo} alt="" draggable={false} className="block h-[30px] w-[30px] object-contain" />
        <span className="mt-[3px] text-[9px]">nego</span>
      </button>
    </div>
  );
}
