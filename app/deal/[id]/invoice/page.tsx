"use client";
// I1 Invoice check: compares supplier invoice INV-8841 against the deal's pinned terms.
// Mismatches turn coral; nothing is paid until it matches or the owner accepts anyway.

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as api from "@/lib/api";
import { useApi } from "@/lib/useApi";
import { useDemo } from "@/lib/demo-context";
import type { Terms } from "@/lib/types";
import { Screen } from "@/components/Screen";
import { StatusBar } from "@/components/StatusBar";
import { BusinessLogo } from "@/components/BusinessLogo";
import { Wakil } from "@/components/Wakil";
import { Button } from "@/components/Button";
import { ChevronLeft } from "@/components/Icons";
import { InvoiceDiff, compareInvoice, type InvoiceLines } from "@/components/InvoiceDiff";

/** The supplier's synthetic first invoice: RM0.30/kg over the pinned price, plus a RM10 delivery fee. */
const invoiceFor = (t: Terms): InvoiceLines => ({ qtyKg: t.qtyKgWeekly, pricePerKg: Math.round((t.pricePerKg + 0.3) * 100) / 100, deliveryFee: 10, paymentDays: t.paymentDays });

export default function InvoicePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { role } = useDemo();
  const deal = useApi(() => api.getDeal(params.id), [params.id]);
  const [done, setDone] = useState<null | "fix" | "accepted">(null);
  if (!deal) return <Screen>{null}</Screen>;

  const diff = compareInvoice(deal.terms, invoiceFor(deal.terms));
  const buyerPeople = api.people(deal, "buyer");
  const supplier = api.parties(deal).supplier;
  const actor = role === "owner" ? `${buyerPeople.owner} · owner` : `${buyerPeople.staff} · ${buyerPeople.staffTitle}`;
  const found = [
    diff.rows.find((r) => r.key === "price")?.bad && "price is RM0.30/kg higher",
    diff.rows.find((r) => r.key === "delivery")?.bad && `a delivery fee was charged despite the ${deal.terms.deliveryRule.toLowerCase()}`,
  ].filter(Boolean);

  const requestFix = async () => {
    await api.log({ side: "buyer", kind: "human", staffVisible: role === "staff", action: "Asked Wakil to request a fix · INV-8841", actor, reason: `${diff.mismatches} lines don't match the pinned terms` });
    await api.log({ side: "buyer", kind: "agent", staffVisible: false, action: `Requested corrected invoice from ${supplier.short}`, actor: `${api.wakilName(deal.buyerId)} · agent`, reason: `Pinned terms: RM${deal.terms.pricePerKg.toFixed(2)}/kg, ${deal.terms.deliveryRule.toLowerCase()}` });
    setDone("fix");
  };
  const acceptAnyway = async () => {
    await api.log({ side: "buyer", kind: "human", staffVisible: role === "staff", action: "Accepted INV-8841 anyway", actor, reason: `Overpay RM${diff.overpay.toFixed(2)} accepted` });
    setDone("accepted");
  };

  return (
    <Screen>
      <StatusBar />
      <div className="flex flex-none items-center gap-3 px-4 pb-3 pt-1">
        <Link
          href={`/deal/${deal.id}`}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-line bg-white shadow-card"
          aria-label="Back to deal"
        >
          <ChevronLeft size={16} />
        </Link>
        <BusinessLogo src={supplier.logo} name={supplier.short} size={44} />
        <div className="min-w-0 flex-1">
          <div className="text-[20px] font-extrabold tracking-[-0.02em]">Invoice check</div>
          <div className="mt-0.5 whitespace-nowrap font-mono text-[11px] text-muted">INV-8841 · week of 27 Oct</div>
        </div>
      </div>
      <div className="mx-4 flex flex-none flex-col gap-3 rounded-hero bg-white p-4 shadow-hero">
        <div className="flex items-center gap-2">
          <span
            className={`flex h-[26px] items-center whitespace-nowrap rounded-full px-3 text-[12px] font-semibold ${
              diff.mismatches ? "bg-coral-soft text-coral-text" : "bg-teal-soft text-teal-text"
            }`}
          >
            {diff.mismatches ? `${diff.mismatches} lines don't match` : "All lines match"}
          </span>
          <span className="text-[11px] text-muted">checked in 2 s</span>
        </div>
        <InvoiceDiff diff={diff} />
      </div>
      <div className="mx-4 mt-2.5 flex flex-none items-center gap-2.5 rounded-[18px] bg-purple-soft px-3.5 py-2.5">
        <Wakil side="buyer" width={38} height={42} turn={-18} bust logo={api.parties(deal).buyer.logo} className="-my-1" />
        <div className="text-[12px] leading-[1.45] text-purple-text">
          <span className="font-semibold">
            Wakil found {found.length === 1 ? "one mismatch" : `${found.length} mismatches`}:{" "}
          </span>
          {found.join(" and ")}.
        </div>
      </div>
      <div className="flex-1" />
      <div className="flex flex-none flex-col gap-2 px-4 pb-[30px] pt-3">
        {done ? (
          <div className="flex h-[54px] items-center justify-center rounded-full bg-purple-soft text-[15px] font-semibold text-purple-text">
            {done === "fix" ? "Sent · Wakil is requesting a fix" : "Accepted · written to the log"}
          </div>
        ) : (
          <Button variant="wakil" height={54} onClick={requestFix}>
            Ask Wakil to request a fix
          </Button>
        )}
        <div className="grid grid-cols-2 gap-2">
          <Button variant="secondary" height={46} fontSize={13} onClick={() => router.push(`/deal/${deal.id}`)}>
            Chat with supplier
          </Button>
          <Button variant="secondary" height={46} fontSize={13} className="!text-muted" onClick={done ? undefined : acceptAnyway}>
            Accept anyway
          </Button>
        </div>
        <div className="text-center text-[11px] text-muted">Nothing is paid until it matches or you accept.</div>
      </div>
    </Screen>
  );
}
