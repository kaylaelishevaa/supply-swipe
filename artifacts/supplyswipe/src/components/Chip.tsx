// Pill chip. ok = teal-soft, warn = amber-soft, bad = coral-soft, neutral, selected = ink.

import type { ReactNode } from "react";
import type { ChipTone } from "@/lib/types";

export type ChipVariant = ChipTone | "selected";

const tones: Record<ChipVariant, string> = {
  ok: "bg-teal-soft text-teal",
  warn: "bg-amber-soft text-amber",
  bad: "bg-coral-soft text-coral",
  neutral: "bg-neutral text-muted",
  selected: "bg-ink text-white",
};

export function Chip({
  tone = "neutral",
  children,
  onClick,
  className = "",
}: {
  tone?: ChipVariant;
  children: ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  const Tag = onClick ? "button" : "span";
  return (
    <Tag
      onClick={onClick}
      className={`inline-flex h-[26px] items-center whitespace-nowrap rounded-full px-[10px] text-[12px] font-semibold ${tones[tone]} ${className}`}
    >
      {children}
    </Tag>
  );
}
