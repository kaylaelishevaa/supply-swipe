"use client";
// S3 at 1280×800 (?view=desktop). Placeholder until the desktop layout is built.

import Link from "next/link";
import type { NegotiationView } from "@/lib/types";

export function NegotiationDesktop({ view }: { view: NegotiationView }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg">
      <Link href={`/negotiation/${view.id}`} className="rounded-full bg-ink px-5 py-3 text-[14px] font-semibold text-white">
        Open the mobile view
      </Link>
    </div>
  );
}
