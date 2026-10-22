"use client";
// Pill button with the five variants from the style tile.
// approve = teal, only for a human Approve tap (one per screen). primary = ink.
// wakil = purple-soft, for actions that send a Wakil. secondary = white. disabled = line + lock.

import type { ReactNode } from "react";
import { LockIcon } from "./Icons";

type Variant = "approve" | "primary" | "wakil" | "secondary" | "disabled";

const styles: Record<Variant, string> = {
  approve: "bg-teal text-white shadow-approve active:translate-y-px",
  primary: "bg-ink text-white shadow-ink active:translate-y-px",
  wakil: "bg-purple-soft text-purple-text shadow-wakil active:translate-y-px",
  secondary: "bg-white text-ink shadow-ctl active:translate-y-px",
  disabled: "bg-line text-disabled cursor-not-allowed",
};

export function Button({
  variant = "primary",
  children,
  onClick,
  className = "",
  height = 52,
  type = "button",
}: {
  variant?: Variant;
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  height?: number;
  type?: "button" | "submit";
}) {
  const disabled = variant === "disabled";
  return (
    <button
      type={type}
      onClick={disabled ? undefined : onClick}
      aria-disabled={disabled}
      style={{ height }}
      className={`flex w-full select-none items-center justify-center gap-2 whitespace-nowrap rounded-full px-4 font-semibold transition-transform ${
        height >= 52 ? "text-[15px]" : height >= 46 ? "text-[14px]" : "text-[13px]"
      } ${styles[variant]} ${className}`}
    >
      {disabled && <LockIcon size={12} color="#8D8BA3" />}
      {children}
    </button>
  );
}
