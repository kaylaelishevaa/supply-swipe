// Rule-based negotiation between two Wakils. Code picks every price: each side moves toward the
// other's last offer in steps and never offers past its own sealed limit (a step that would is
// blocked and re-drafted at the limit, and the rule check is recorded). Wording is templated and
// every reason uses public numbers only, so no sealed value is ever written into a message.

import type { BuyerProfile, SupplierProfile } from "./mock";
import type { MsgType, NegMessage, Side, Terms } from "./types";

export interface RuleEvent {
  side: Side;
  /** The message the blocked draft was replaced by. */
  n: number;
  action: string;
  reason: string;
}

export interface Outcome {
  result: "deal" | "no_deal";
  /** no_overlap: the floor is above the maximum, so no message is sent. message_limit: no agreement in time. */
  reason?: "no_overlap" | "message_limit";
  messages: NegMessage[];
  rules: RuleEvent[];
  terms?: Terms;
}

export interface NegotiationInput {
  buyer: BuyerProfile;
  supplier: SupplierProfile;
  buyerShort: string;
  marketPerKg: number;
  maxMessages: number;
  /** Clock time of the first message, "HH:MM". */
  startAt: string;
  /** Random source in [0, 1); pass a fixed one for repeatable runs. */
  rand?: () => number;
}

const round05 = (v: number) => Math.round(v * 20) / 20;
const rm = (v: number) => "RM" + v.toFixed(2);
const pay = (days: number) => (days === 0 ? "COD" : `${days}-day terms`);
const list = (days: string[]) =>
  days.length === 6 ? "Mon–Sat" : days.length > 1 ? `${days.slice(0, -1).join(", ")} and ${days[days.length - 1]}` : days.join("");

function addMinutes(hhmm: string, minutes: number) {
  const [h, m] = hhmm.split(":").map(Number);
  const t = h * 60 + m + minutes;
  return `${String(Math.floor(t / 60) % 24).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`;
}

export function negotiate({ buyer: b, supplier: s, buyerShort, marketPerKg, maxMessages, startAt, rand = Math.random }: NegotiationInput): Outcome {
  // Checked before any message: if the floor is above the maximum no deal is possible (0 tokens used).
  if (s.floorPerKg > b.maxPerKg) return { result: "no_deal", reason: "no_overlap", messages: [], rules: [] };

  const pick = <T,>(options: T[]) => options[Math.floor(rand() * options.length)];
  const step = (lo: number, hi: number) => lo + (hi - lo) * rand();

  const daysOk = b.days.every((d) => s.days.includes(d));
  const days = daysOk ? b.days : s.days;
  const freeDelivery = b.qtyKg > s.freeDeliveryAboveKg;
  const paymentDays = Math.min(b.paymentDays, s.paymentDays);
  const trialWeeks = 2; // every match in the demo is a new relationship
  const delivery = freeDelivery ? `delivery waived above ${s.freeDeliveryAboveKg} kg` : `RM${s.deliveryFee} delivery below ${s.freeDeliveryAboveKg} kg`;

  const messages: NegMessage[] = [];
  const rules: RuleEvent[] = [];
  const add = (side: Side, type: MsgType, price: number | undefined, headline: string, text: string, why: string) => {
    const n = messages.length + 1;
    messages.push({ n, side, type, pricePerKg: price, headline, text, why, at: addMinutes(startAt, Math.floor((n - 1) / 2)) });
  };
  const offer = (side: Side, type: MsgType, price: number, text: string, why: string) => add(side, type, price, `${rm(price)}/kg`, text, why);

  const accept = (side: Side, price: number): Outcome => {
    offer(
      side,
      "accept",
      price,
      `${pick(["Setuju.", "Deal.", "Okay, agreed."])} ${rm(price)}/kg, ${freeDelivery ? "free delivery" : `RM${s.deliveryFee} delivery`}, ${pay(paymentDays)}, ${trialWeeks}-week trial.`,
      side === "supplier" ? pick(["volume covers delivery cost", "steady weekly order on our route"]) : `market ${rm(marketPerKg)}, on time ${s.onTime}`,
    );
    const terms: Terms = {
      item: "Chicken breast, skinless, grade A",
      qtyKgWeekly: b.qtyKg,
      days,
      before: "9am",
      pricePerKg: price,
      deliveryRule: freeDelivery ? `Free delivery above ${s.freeDeliveryAboveKg} kg` : `RM${s.deliveryFee} delivery below ${s.freeDeliveryAboveKg} kg`,
      paymentDays,
      trialWeeks,
      weeklyTotal: Math.round(b.qtyKg * price * 100) / 100,
    };
    return { result: "deal", messages, rules, terms };
  };

  // 1. The buyer's Wakil asks; 2. the supplier's opens at its public list price.
  add(
    "buyer",
    "ask",
    undefined,
    `${b.qtyKg} kg · ${b.days.length === 6 ? "Mon–Sat" : b.days.join(", ")} · ${b.area}`,
    pick([
      `Can you deliver ${b.qtyKg} kg skinless chicken breast to ${b.area} every ${list(b.days)}? Lead time?`,
      `Boss, need ${b.qtyKg} kg chicken breast weekly, ${list(b.days)} drops to ${b.area}. Can?`,
    ]),
    `weekly request from ${buyerShort}`,
  );
  let supplierLast = s.listPerKg;
  offer(
    "supplier",
    "offer",
    supplierLast,
    `${daysOk ? "Yes, next-day." : `We deliver ${list(s.days)} only.`} ${rm(supplierLast)}/kg, RM${s.deliveryFee} delivery, ${pay(s.paymentDays)}.`,
    "list price, new buyer",
  );

  // 3. The buyer's Wakil opens just under the public market price.
  let buyerLast = Math.min(round05(marketPerKg - step(0.05, 0.2)), round05(b.maxPerKg - 0.05));
  if (buyerLast >= supplierLast) return accept("buyer", supplierLast);
  offer("buyer", "counter", buyerLast, `${rm(buyerLast)}/kg, free delivery, ${pay(b.paymentDays)}, standing weekly order.`, `market ${rm(marketPerKg)}, ${b.qtyKg} kg every week`);

  while (messages.length < maxMessages) {
    // Supplier's turn: accept if close enough, otherwise come down part of the gap, never below the floor.
    if (supplierLast - buyerLast <= 0.1 && buyerLast >= s.floorPerKg) return accept("supplier", buyerLast);
    let next = Math.min(round05(supplierLast - step(0.35, 0.6) * (supplierLast - buyerLast)), round05(supplierLast - 0.05));
    // A Wakil's own offer stays strictly inside its limit, so no message ever carries the sealed value itself.
    const lowest = round05(s.floorPerKg + 0.05);
    if (next < lowest) {
      rules.push({ side: "supplier", n: messages.length + 1, action: `Offer blocked · ${rm(next)} is below your floor`, reason: "Wakil re-drafted inside your sealed floor" });
      next = lowest;
    }
    if (next <= buyerLast) return accept("supplier", buyerLast);
    supplierLast = next;
    offer(
      "supplier",
      "counter",
      supplierLast,
      pick([`${rm(supplierLast)}/kg, ${delivery}, ${pay(s.paymentDays)}.`, `Can do ${rm(supplierLast)}/kg if it is a standing order, ${delivery}.`]),
      pick([`${b.qtyKg} kg weekly ${b.qtyKg >= s.moqKg ? "clears" : "is under"} MOQ ${s.moqKg} kg`, `on time ${s.onTime}, steady weekly volume`, `market ${rm(marketPerKg)}, feed costs up`]),
    );
    if (messages.length >= maxMessages) break;

    // Buyer's turn: accept if close enough, otherwise come up part of the gap, never above the maximum.
    if (supplierLast - buyerLast <= 0.1 && supplierLast <= b.maxPerKg) return accept("buyer", supplierLast);
    let up = Math.max(round05(buyerLast + step(0.3, 0.55) * (supplierLast - buyerLast)), round05(buyerLast + 0.05));
    const highest = round05(b.maxPerKg - 0.05);
    if (up > highest) {
      rules.push({ side: "buyer", n: messages.length + 1, action: `Offer blocked · ${rm(up)} is above your limit`, reason: "Wakil re-drafted inside your sealed max" });
      up = highest;
    }
    if (up >= supplierLast) return accept("buyer", supplierLast);
    buyerLast = up;
    offer(
      "buyer",
      "counter",
      buyerLast,
      pick([`${rm(buyerLast)}/kg, ${pay(paymentDays)}, starting with a ${trialWeeks}-week trial.`, `Meet me at ${rm(buyerLast)}/kg? ${pay(paymentDays)}, regular order every week.`]),
      pick([`market ${rm(marketPerKg)}, supplier on time ${s.onTime}`, `${b.qtyKg} kg every week, standing order`, `market ${rm(marketPerKg)}`]),
    );
  }
  return { result: "no_deal", reason: "message_limit", messages, rules };
}
