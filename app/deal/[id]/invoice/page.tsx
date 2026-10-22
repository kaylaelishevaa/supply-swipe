"use client";
// I1 Invoice check: compares supplier invoice INV-8841 against the deal's pinned terms.
// Mismatches turn coral; nothing is paid until it matches or the owner accepts anyway.

import { useState } from "react";
import { useRouter } from "next/navigation";
import * as api from "@/lib/api";
import { useApi } from "@/lib/useApi";
import { useDemo } from "@/lib/demo-context";
import { LOGO } from "@/lib/mock";
import { Screen } from "@/components/Screen";
import { StatusBar } from "@/components/StatusBar";
import { BusinessLogo } from "@/components/BusinessLogo";
import { Wakil } from "@/components/Wakil";
import { Button } from "@/components/Button";
import { InvoiceDiff, compareInvoice, type InvoiceLines } from "@/components/InvoiceDiff";

// Synthetic invoice as received from Ayam Segar.
const INVOICE: InvoiceLines = { qtyKg: 50, pricePerKg: 12.5, deliveryFee: 10, paymentDays: 7 };

export default function InvoicePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { role } = useDemo();
  const deal = useApi(() => api.getDeal(params.id), [params.id]);
  const [done, setDone] = useState<null | "fix" | "accepted">(null);
  if (!deal) return <Screen>{null}</Screen>;

  const diff = compareInvoice(deal.terms, INVOICE);
  const actor = role === "owner" ? "Mak Ngah · owner" : "Aisyah · kitchen lead";

  const requestFix = async () => {
    await api.log({ side: "buyer", kind: "human", staffVisible: role === "staff", action: "Asked Wakil to request a fix · INV-8841", actor, reason: `${diff.mismatches} lines don't match the pinned terms` });
    await api.log({ side: "buyer", kind: "agent", staffVisible: false, action: "Requested corrected invoice from Ayam Segar", actor: "Wakil Mak Ngah · agent", reason: `Pinned terms: RM${deal.terms.pricePerKg.toFixed(2)}/kg, free delivery above 40 kg` });
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
        <BusinessLogo src={LOGO.ayamSegar} name="Ayam Segar" size={44} />
        <div className="min-w-0 flex-1">
          <div className="text-[22px] font-extrabold tracking-[-0.02em]">Invoice check</div>
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
        {diff.overpay > 0 && (
          <div className="flex items-center justify-between rounded-[16px] bg-coral-soft px-3 py-2.5">
            <span className="text-[13px] font-semibold">You&apos;d overpay</span>
            <span className="text-[18px] font-extrabold text-coral-text">RM{diff.overpay.toFixed(2)}</span>
          </div>
        )}
      </div>
      <div className="mx-4 mt-3 flex flex-none items-start gap-1">
        <Wakil side="buyer" width={64} height={70} pose="think" turn={-20} bust className="-ml-2 -mr-0.5 -mt-1.5" />
        <div className="flex-1 rounded-[6px_22px_22px_22px] bg-purple-soft px-3 py-2.5 text-[13px] leading-[1.45]">
          {done === "fix"
            ? "Sent to Ayam Segar. I asked for RM12.20/kg and free delivery, as pinned. I will check the new invoice."
            : "Pinned terms say RM12.20/kg and free delivery above 40 kg. I can ask Ayam Segar for a corrected invoice."}
          <div className="mt-1 text-[11px] text-purple-text">Why: deal #SS-0142, agreed 22 Oct by both owners</div>
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
