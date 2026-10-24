"use client";
// Negotiation helpers: the replay hook that drives S3, rail maths, and the two rule checks
// every Wakil message passes before it is sent (the backend runs the same checks).

import { useCallback, useEffect, useRef, useState } from "react";
import type { NegMessage, Side, Terms } from "./types";

/** Steps: 0 ready → 1..n messages → n+1 deal found → n+2 approval sheet. */
export function useNegotiationReplay(messages: NegMessage[], intervalMs = 1500, autoStart = true) {
  const total = messages.length;
  const last = total + 2;
  const [step, setStep] = useState(autoStart ? 0 : last);
  // pop = false for ~40ms after a new message, so the bubble can animate from scale .9 to 1.
  const [pop, setPop] = useState(true);
  const timer = useRef<ReturnType<typeof setInterval>>();
  const stepRef = useRef(step);

  const restart = useCallback(() => {
    clearInterval(timer.current);
    stepRef.current = 0;
    setStep(0);
    setPop(true);
    timer.current = setInterval(() => {
      if (stepRef.current >= last) {
        clearInterval(timer.current);
        return;
      }
      const next = stepRef.current + 1;
      stepRef.current = next;
      setStep(next);
      if (next <= total) {
        setPop(false);
        setTimeout(() => setPop(true), 40);
      }
    }, intervalMs);
  }, [intervalMs, last, total]);

  useEffect(() => {
    if (autoStart && total > 0) restart();
    return () => clearInterval(timer.current);
  }, [autoStart, restart, total]);

  const shown = Math.min(step, total);
  return {
    step,
    pop,
    restart,
    shown,
    visible: messages.slice(0, shown),
    dealFound: step >= total + 1,
    sheetOpen: step >= last,
    /** Side that just spoke (null once the deal is found). */
    speaking: shown > 0 && step <= total ? messages[shown - 1].side : null,
    /** Side writing the next message. */
    next: shown < total ? messages[shown].side : null,
  };
}

/** Position of a price on the rail, as a CSS percentage string. */
export function railPct(v: number, scale: { lo: number; hi: number }) {
  return (((v - scale.lo) / (scale.hi - scale.lo)) * 100).toFixed(2) + "%";
}

/** Latest public price offered by one side among the visible messages. */
export function lastPrice(visible: NegMessage[], side: Side): number | undefined {
  for (let i = visible.length - 1; i >= 0; i--) {
    const m = visible[i];
    if (m.side === side && m.pricePerKg != null) return m.pricePerKg;
  }
  return undefined;
}

export const rm = (v: number) => "RM" + v.toFixed(2);

/** A weekly total: whole ringgit when it is round (RM610), sen otherwise (RM617.50). */
export const rmTotal = (v: number) => "RM" + (Number.isInteger(v) ? String(v) : v.toFixed(2));

/** A signed per-kg difference, e.g. "−RM0.60" or "+RM0.10". */
export const rmDiff = (v: number) => (v < 0 ? "−" : "+") + rm(Math.abs(v));

/** "Mon and Thu", or "Mon, Wed and Fri". */
export const dayList = (days: string[]) => (days.length > 1 ? `${days.slice(0, -1).join(", ")} and ${days[days.length - 1]}` : days.join(""));

/** One line describing the pinned terms, e.g. "RM12.20/kg · 50 kg Mon and Thu before 9am · ...". */
export function termsLine(t: Terms, { price = true } = {}) {
  return [
    price ? `${rm(t.pricePerKg)}/kg` : null,
    `${t.qtyKgWeekly} kg ${dayList(t.days)} before ${t.before}`,
    t.deliveryRule.charAt(0).toLowerCase() + t.deliveryRule.slice(1),
    `${t.paymentDays}-day terms`,
    t.trialWeeks ? `${t.trialWeeks}-week trial` : null,
  ]
    .filter(Boolean)
    .join(" · ");
}

// ---------- Rule checks (run before any Wakil message leaves its side) ----------

export type RuleResult = { ok: true } | { ok: false; action: string; reason: string };

/** No offer outside the sender's own sealed limit. */
export function checkOfferWithinLimit(side: Side, pricePerKg: number, ownLimit: number): RuleResult {
  if (side === "buyer" && pricePerKg > ownLimit)
    return { ok: false, action: `Offer blocked · ${rm(pricePerKg)} is above your limit`, reason: "Wakil re-drafted inside your sealed max" };
  if (side === "supplier" && pricePerKg < ownLimit)
    return { ok: false, action: `Offer blocked · ${rm(pricePerKg)} is below your floor`, reason: "Wakil re-drafted inside your sealed floor" };
  return { ok: true };
}

/** No draft may contain the sender's own sealed value, in any common spelling. */
export function checkNoPrivateValue(side: Side, draft: string, ownLimit: number): RuleResult {
  const forms = [ownLimit.toFixed(2), ownLimit.toFixed(1), `RM ${ownLimit.toFixed(2)}`, `RM${ownLimit.toFixed(2)}`];
  if (forms.some((f) => draft.includes(f)))
    return { ok: false, action: `Draft blocked · would reveal your ${side === "buyer" ? "maximum" : "floor"}`, reason: "Rewritten before sending. No private value left the app." };
  return { ok: true };
}
