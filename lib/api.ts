// Every read and write in the app goes through this file.
// Today it uses the local mock (lib/mock.ts) and keeps demo state in localStorage so the
// journey survives a reload. To switch to FastAPI + Supabase, replace the function bodies
// with fetch calls that return the same types (see lib/types.ts). Screens do not change.

import type { Deal, LogRow, NegotiationView, Role, Side, WakilProfile, Counterpart } from "./types";
import {
  BUSINESSES, BUYER_CARDS, DEAL_ID, DEFAULT_WAKIL, ME, NEGOTIATION_ID, PUBLIC, SEALED_LIMITS, SEALED_TIMES,
  SUPPLIER_CARDS, TRANSCRIPT, initialDeal, initialLog,
} from "./mock";

const STORE_KEY = "supplyswipe.store.v2";

interface Store {
  deal: Deal;
  log: LogRow[];
  /** Idempotency keys for log rows, so repeating a demo step does not duplicate rows. */
  logKeys: string[];
  wakil: Record<Side, WakilProfile>;
  postedRequest: boolean;
}

const fresh = (): Store => ({
  deal: initialDeal(),
  log: initialLog(),
  // The seed already holds Aisyah's post and swipe, so repeating those steps adds no duplicates.
  logKeys: ["post:chicken", "swipe:buyer:ayam-segar"],
  wakil: { buyer: { ...DEFAULT_WAKIL.buyer }, supplier: { ...DEFAULT_WAKIL.supplier } },
  postedRequest: false,
});

let store: Store | null = null;
const listeners = new Set<() => void>();

function load(): Store {
  if (store) return store;
  store = fresh();
  if (typeof window !== "undefined") {
    try {
      const raw = window.localStorage.getItem(STORE_KEY);
      if (raw) store = { ...fresh(), ...JSON.parse(raw) };
    } catch {
      // Private mode or blocked storage: keep the in-memory store.
    }
  }
  return store!;
}

function save() {
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(STORE_KEY, JSON.stringify(store));
    } catch {
      // ignore
    }
  }
  listeners.forEach((fn) => fn());
}

/** Screens subscribe to re-read data after any write (useApi does this). */
export function subscribe(fn: () => void) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

const clone = <T>(v: T): T => JSON.parse(JSON.stringify(v));
/**
 * Demo clock. The story runs on Wednesday morning (09:02 post → 09:20 sealed), so rows without a
 * fixed time get one minute after the latest row instead of the real wall-clock time.
 */
const nowHHMM = () => {
  const latest = load().log.reduce((m, r) => (r.at > m ? r.at : m), "09:20");
  const [h, mi] = latest.split(":").map(Number);
  const t = h * 60 + mi + 1;
  return `${String(Math.floor(t / 60) % 24).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`;
};

// ---------- Activity log (append-only) ----------

export async function log(row: Omit<LogRow, "id" | "at"> & { at?: string }, key?: string): Promise<void> {
  const s = load();
  if (key && s.logKeys.includes(key)) return;
  if (key) s.logKeys.push(key);
  s.log.push({ ...row, id: `r${Date.now()}${Math.random().toString(36).slice(2, 6)}`, at: row.at ?? nowHHMM() });
  save();
}

/** Owners see every row for their side. Staff see only their own rows. */
export async function getLog(side: Side, role: Role): Promise<LogRow[]> {
  // Stable sort by time so a step done out of story order (e.g. limits at 08:58) reads in order.
  const rows = load()
    .log.filter((r) => r.side === side || r.side === "both")
    .map((r, i) => ({ r, i }))
    .sort((a, b) => (a.r.at === b.r.at ? a.i - b.i : a.r.at < b.r.at ? -1 : 1))
    .map(({ r }) => r);
  return clone(role === "owner" ? rows : rows.filter((r) => r.staffVisible));
}

// ---------- Profiles and feed ----------

export async function getBusiness(id: string) {
  return BUSINESSES[id];
}

export function me(side: Side) {
  return { ...ME[side], business: BUSINESSES[ME[side].businessId] };
}

/** Rule-based feed (no AI): buyers see suppliers, suppliers see buyer requests. */
export async function getFeed(side: Side): Promise<Counterpart[]> {
  return clone(side === "buyer" ? SUPPLIER_CARDS : BUYER_CARDS);
}

export async function postRequest(): Promise<void> {
  const s = load();
  s.postedRequest = true;
  await log({ side: "buyer", kind: "human", staffVisible: true, action: "Posted request · 50 kg chicken breast", actor: "Aisyah · kitchen lead", reason: "Weekly stock count", at: "09:02" }, "post:chicken");
}

/**
 * The trigger. Swiping right posts /negotiations. Returns the negotiation id to open.
 * In the demo, Ayam Segar opens the main negotiation and Fresh Poultry ends in no deal.
 */
export async function startNegotiation(side: Side, counterpartId: string): Promise<{ id: string; noDeal: boolean }> {
  const card = (side === "buyer" ? SUPPLIER_CARDS : BUYER_CARDS).find((c) => c.id === counterpartId);
  const who = side === "buyer" ? "Aisyah · kitchen lead" : "Sales rep · Ayam Segar";
  await log(
    { side, kind: "human", staffVisible: true, action: `Swiped right on ${card?.name.replace(" Enterprise", "") ?? counterpartId}`, actor: who, reason: card ? `${card.fit}% fit, ${card.why}` : "", at: counterpartId === "ayam-segar" ? "09:04" : undefined },
    `swipe:${side}:${counterpartId}`,
  );
  if (counterpartId === "fresh-poultry") return { id: "n-0139", noDeal: true };
  return { id: NEGOTIATION_ID, noDeal: false };
}

export async function skipCard(side: Side, counterpartId: string): Promise<void> {
  const card = (side === "buyer" ? SUPPLIER_CARDS : BUYER_CARDS).find((c) => c.id === counterpartId);
  await log({ side, kind: "human", staffVisible: true, action: `Skipped ${card?.name ?? counterpartId}`, actor: side === "buyer" ? "Aisyah · kitchen lead" : "Sales rep · Ayam Segar", reason: card?.why ?? "" }, `skip:${side}:${counterpartId}`);
}

// ---------- Negotiation ----------

/**
 * Builds what ONE side may see. Only the viewer's own sealed limit is read.
 * The band's other end is estimated from public numbers, so the counterpart's limit never
 * appears in this object. The backend must do the same server-side.
 */
export async function getNegotiation(id: string, viewer: Side): Promise<NegotiationView> {
  const own = SEALED_LIMITS[viewer];
  const band =
    viewer === "buyer"
      ? { lo: +(PUBLIC.marketPerKg - 0.3).toFixed(2), hi: own } // floor side estimated: market - RM0.30
      : { lo: own, hi: +(PUBLIC.buyerTargetPerKg - 0.5).toFixed(2) }; // max side estimated: public target - RM0.50
  return {
    id,
    viewer,
    buyerId: "mak-ngah",
    supplierId: "ayam-segar",
    item: "Chicken breast, skinless",
    qtyLabel: "50 kg weekly",
    marketPerKg: PUBLIC.marketPerKg,
    ownLimitPerKg: own,
    band,
    scale: { lo: 11.7, hi: 12.9 },
    messages: clone(TRANSCRIPT),
    maxMessages: 10,
    dealId: DEAL_ID,
    result: "deal",
  };
}

// ---------- Deal and approvals ----------

export async function getDeal(id: string): Promise<Deal> {
  void id;
  return clone(load().deal);
}

const ownerName = (side: Side) => ME[side].owner;
const actorLabel = (side: Side, role: Role) =>
  role === "owner"
    ? side === "buyer" ? "Mak Ngah · owner" : "Encik Roslan · owner, Ayam Segar"
    : side === "buyer" ? "Aisyah · kitchen lead" : "Sales rep · Ayam Segar";

export function approvalLimit(side: Side, role: Role): number {
  return role === "owner" ? Infinity : ME[side].staffLimit;
}

export type ApproveResult = { ok: true; deal: Deal } | { ok: false; reason: "above_limit" | "already" | "rejected" };

/** A deal is sealed only when both sides have approved. Staff can approve only up to their limit. */
export async function approve(dealId: string, side: Side, role: Role): Promise<ApproveResult> {
  const s = load();
  const d = s.deal;
  void dealId;
  if (d.status === "rejected") return { ok: false, reason: "rejected" };
  if (d.terms.weeklyTotal > approvalLimit(side, role)) return { ok: false, reason: "above_limit" };
  if (d.approvals.some((a) => a.side === side)) return { ok: false, reason: "already" };

  const at = role === "owner" ? (side === "buyer" ? SEALED_TIMES.buyerOwner : SEALED_TIMES.supplierOwner) : nowHHMM();
  const by = role === "owner" ? ownerName(side) : ME[side].staff;
  d.approvals.push({ by, side, role, at });
  const reason =
    side === "buyer"
      ? role === "owner" ? "Above staff limit RM500" : "Under staff limit RM500"
      : role === "owner" ? "Above floor, new PJ route" : "Under rep limit RM300";
  await log({ side: "both", kind: "approval", staffVisible: role === "staff", action: side === "buyer" ? `Approved RM${d.terms.weeklyTotal} per week` : "Approved", actor: actorLabel(side, role), reason, at }, `approve:${d.id}:${side}`);

  const both = d.approvals.some((a) => a.side === "buyer") && d.approvals.some((a) => a.side === "supplier");
  if (both) {
    d.status = "sealed";
    d.poNumber = "PO-2210-0142";
    await log({ side: "both", kind: "approval", staffVisible: false, action: "Deal record created", actor: "SupplySwipe · system", reason: "Both owners approved", at }, `sealed:${d.id}`);
    await log({ side: "buyer", kind: "agent", staffVisible: false, action: "Saved memory", actor: "Wakil Mak Ngah · agent", reason: "Ayam Segar takes 7-day terms; trial until 5 Nov", at }, `memory:${d.id}:buyer`);
  } else {
    d.status = side === "buyer" ? "buyer_approved" : "supplier_approved";
  }
  save();
  return { ok: true, deal: clone(d) };
}

export async function reject(dealId: string, side: Side, role: Role, reason: string): Promise<void> {
  const s = load();
  void dealId;
  s.deal.status = "rejected";
  await log({ side: "both", kind: "approval", staffVisible: role === "staff", action: "Rejected deal", actor: actorLabel(side, role), reason: reason || "No reason given" });
}

/** Staff above their limit: one notification to the owner. */
export async function askOwner(dealId: string, side: Side): Promise<string> {
  const s = load();
  void dealId;
  const at = side === "buyer" ? SEALED_TIMES.askedOwner : nowHHMM();
  s.deal.askedOwnerAt = at;
  await log({ side, kind: "human", staffVisible: true, action: `Asked ${ownerName(side)} to approve`, actor: actorLabel(side, "staff"), reason: `RM${s.deal.terms.weeklyTotal} is above the staff limit RM${ME[side].staffLimit}`, at }, `ask:${s.deal.id}:${side}`);
  return at;
}

export async function undoAskOwner(dealId: string, side: Side): Promise<void> {
  const s = load();
  void dealId;
  s.deal.askedOwnerAt = undefined;
  s.logKeys = s.logKeys.filter((k) => k !== `ask:${s.deal.id}:${side}`);
  await log({ side, kind: "human", staffVisible: true, action: "Cancelled request to owner", actor: actorLabel(side, "staff"), reason: "Undo within the same minute" });
}

/** Counter via Wakil: the same negotiation resumes for at most 4 more messages, inside the sealed limits. */
export async function counterViaWakil(dealId: string, side: Side, role: Role, note: string): Promise<void> {
  void dealId;
  await log({ side, kind: "human", staffVisible: role === "staff", action: "Sent a counter note to Wakil", actor: actorLabel(side, role), reason: note.slice(0, 80) });
  await log({ side, kind: "agent", staffVisible: false, action: "Resumed negotiation · up to 4 more messages", actor: `${load().wakil[side].name} · agent`, reason: "Your note guides wording. Limits stay sealed." });
}

// ---------- Wakil profile ----------

export async function getWakil(side: Side): Promise<WakilProfile> {
  return clone(load().wakil[side]);
}

/** Notes change wording only. Prices and limits never come from here. */
export async function saveWakil(side: Side, cfg: WakilProfile): Promise<void> {
  load().wakil[side] = clone(cfg);
  save();
}

export async function resetDemo(): Promise<void> {
  store = fresh();
  save();
}

// ---------- Own sealed limit (feed card backs) ----------

/** The viewer's OWN sealed limit only (buyer max or supplier floor). Never the counterpart's. */
export async function getOwnLimit(side: Side): Promise<number> {
  return SEALED_LIMITS[side];
}
