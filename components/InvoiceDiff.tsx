// Agreed vs invoice table. Each invoice line is compared with the deal's pinned terms
// (qty, price per kg, delivery fee, payment terms); any difference turns coral-soft.

import type { Terms } from "@/lib/types";

export interface InvoiceLines {
  qtyKg: number;
  pricePerKg: number;
  deliveryFee: number;
  paymentDays: number;
}

export function compareInvoice(terms: Terms, inv: InvoiceLines) {
  // Free delivery applies above 40 kg, per the pinned delivery rule.
  const agreedDelivery = terms.qtyKgWeekly > 40 ? 0 : 10;
  const agreedTotal = terms.qtyKgWeekly * terms.pricePerKg + agreedDelivery;
  const invoiceTotal = inv.qtyKg * inv.pricePerKg + inv.deliveryFee;
  const rows = [
    { key: "qty", label: "Chicken breast · weekly", agreed: `${terms.qtyKgWeekly} kg`, invoice: `${inv.qtyKg} kg`, bad: inv.qtyKg !== terms.qtyKgWeekly },
    { key: "price", label: "Price per kg", agreed: `RM${terms.pricePerKg.toFixed(2)}`, invoice: `RM${inv.pricePerKg.toFixed(2)}`, bad: inv.pricePerKg !== terms.pricePerKg },
    { key: "delivery", label: "Delivery", agreed: agreedDelivery ? `RM${agreedDelivery.toFixed(2)}` : "Free", invoice: inv.deliveryFee ? `RM${inv.deliveryFee.toFixed(2)}` : "Free", bad: inv.deliveryFee !== agreedDelivery },
    { key: "terms", label: "Terms", agreed: `${terms.paymentDays} days`, invoice: `${inv.paymentDays} days`, bad: inv.paymentDays !== terms.paymentDays },
  ];
  return { rows, agreedTotal, invoiceTotal, mismatches: rows.filter((r) => r.bad).length, overpay: invoiceTotal - agreedTotal };
}

export function InvoiceDiff({ diff }: { diff: ReturnType<typeof compareInvoice> }) {
  const cell = "py-2.5 border-t border-line";
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_86px_86px] text-[12px]">
      <div className="py-1.5 text-muted">Line</div>
      <div className="py-1.5 text-right text-muted">Agreed</div>
      <div className="py-1.5 text-right text-muted">Invoice</div>
      {diff.rows.map((r) => (
        <div key={r.key} className="contents">
          <div className={`${cell} ${r.bad ? "font-semibold" : ""}`}>{r.label}</div>
          <div className={`${cell} text-right`}>{r.agreed}</div>
          <div className={`${cell} text-right`}>
            {r.bad ? (
              <span className="rounded-[8px] bg-coral-soft px-1.5 py-0.5 font-semibold text-coral-text">{r.invoice}</span>
            ) : (
              <span className="font-semibold text-teal-text">{r.invoice}</span>
            )}
          </div>
        </div>
      ))}
      <div className="border-t-[1.5px] border-ink pb-0.5 pt-3 font-extrabold">Total</div>
      <div className="border-t-[1.5px] border-ink pb-0.5 pt-3 text-right font-extrabold">RM{diff.agreedTotal.toFixed(2)}</div>
      <div className={`border-t-[1.5px] border-ink pb-0.5 pt-3 text-right font-extrabold ${diff.overpay !== 0 ? "text-coral-text" : "text-teal-text"}`}>
        RM{diff.invoiceTotal.toFixed(2)}
      </div>
    </div>
  );
}
