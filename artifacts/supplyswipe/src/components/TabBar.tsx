"use client";
// Floating 4-tab pill. Buyer: Requests · Feed · Deals · Log. Supplier: Listings · Requests · Deals · Log.
// The active tab has a 20×3 ink bar above its label.

import { Link } from "wouter";
import { useDemo } from "@/lib/demo-context";
import { DEAL_ID } from "@/lib/mock";

type Tab = { key: string; label: string; href: string };

export function TabBar({ active }: { active: string }) {
  const { side } = useDemo();
  const tabs: Tab[] =
    side === "buyer"
      ? [
          { key: "requests", label: "Requests", href: "/requests/new" },
          { key: "feed", label: "Feed", href: "/feed" },
          { key: "deals", label: "Deals", href: `/deal/${DEAL_ID}` },
          { key: "log", label: "Log", href: "/log" },
        ]
      : [
          { key: "listings", label: "Listings", href: "/listings" },
          { key: "requests", label: "Requests", href: "/feed" },
          { key: "deals", label: "Deals", href: `/approve/${DEAL_ID}` },
          { key: "log", label: "Log", href: "/log" },
        ];
  return (
    <nav className="mx-4 mb-5 grid h-16 flex-none grid-cols-4 rounded-full bg-white px-2 shadow-[0_14px_32px_rgba(60,55,120,0.16)]">
      {tabs.map((t) => {
        const on = t.key === active;
        return (
          <Link
            key={t.key}
            href={t.href}
            className={`flex flex-col items-center justify-center gap-1 text-[11px] ${on ? "font-semibold text-ink" : "text-muted"}`}
          >
            <span className={`h-[3px] w-5 rounded-[2px] ${on ? "bg-ink" : ""}`} />
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
