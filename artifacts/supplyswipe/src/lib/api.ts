// Every read and write in the app goes through this file.
// If NEXT_PUBLIC_API_URL is defined (e.g. http://localhost:8000), it connects to the
// Python FastAPI + Supabase backend. If offline or if the backend is stopped,
// it falls back seamlessly to the local store and localStorage.

import type { Business, Deal, LogRow, NegMessage, NegotiationView, Role, Side, WakilProfile, Counterpart } from "./types";
import {
  BUSINESSES, BUYER_CARDS, BUYER_PROFILES, DEAL_ID, DEFAULT_WAKIL, MAX_MESSAGES, ME, NEGOTIATION_ID, NO_DEAL_ID, PUBLIC,
  SEALED_TIMES, SUPPLIER_CARDS, SUPPLIER_PROFILES, initialLog,
} from "./mock";
import { negotiate, type Outcome } from "./engine";

// The imported Vercel app runs as a local, persistent demo by default.
// An optional separately hosted FastAPI backend can still be connected.
const BACKEND_URL = (import.meta.env.VITE_API_URL ?? "").replace(/\/$/, "");
const STORE_KEY = "supplyswipe.store.v3";

// ---------- Backend calls ----------

/** How long one backend call may take before the app falls back to local data. */
const TIMEOUT_MS = 1000;
/** Starting a negotiation can run several model calls on the backend, so it may take longer. */
const NEGOTIATION_TIMEOUT_MS = 60_000;
/** After a failed call the backend counts as down for this long, so screens stop waiting on it. */
const RETRY_AFTER_MS = 5 * 60_000;
/** Shared across page loads (the /demo wrapper loads every step as a new page). */
const DOWN_KEY = "supplyswipe.backendDownUntil";

function backendDown(): boolean {
  try {
    return Date.now() < Number(window.localStorage.getItem(DOWN_KEY) || 0);
  } catch {
    return false;
  }
}

function markBackendDown() {
  try {
    window.localStorage.setItem(DOWN_KEY, String(Date.now() + RETRY_AFTER_MS));
  } catch {
    // ignore
  }
}

/** One backend call. Null means "use local data": the backend is down, slow or unreachable. */
async function backend(path: string, init?: RequestInit, timeoutMs = TIMEOUT_MS): Promise<Response | null> {
  if (!BACKEND_URL || typeof window === "undefined" || backendDown()) return null;
  try {
    return await fetch(`${BACKEND_URL}${path}`, { ...init, signal: AbortSignal.timeout(timeoutMs) });
  } catch {
    markBackendDown();
    return null;
  }
}

const send = (method: "POST" | "PUT", path: string, body: unknown = {}, timeoutMs?: number) =>
  backend(path, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }, timeoutMs);

/** Reads JSON from a backend call, or null if there was no usable answer. */
async function json<T>(res: Response | null): Promise<T | null> {
  if (!res?.ok) return null;
  try {
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

// ---------- Local store ----------

/** The latest negotiation the two Wakils ran (one at a time in the demo). */
interface StoredNegotiation {
  buyerId: string;
  supplierId: string;
  messages: NegMessage[];
  result: "deal" | "no_deal";
}

interface Store {
  deal: Deal;
  negotiation: StoredNegotiation;
  /** The last swipe that ended before the first message (the floor was above the maximum). */
  noDeal?: { side: Side; counterpartId: string };
  log: LogRow[];
  /** Idempotency keys for log rows, so repeating a demo step does not duplicate rows. */
  logKeys: string[];
  wakil: Record<Side, WakilProfile>;
  postedRequest: boolean;
}

export const wakilName = (businessId: string) => `Wakil ${BUSINESSES[businessId]?.short ?? businessId}`;
const pay = (days: number) => (days === 0 ? "COD" : `${days}-day terms`);

/** Runs the rule-based engine for one buyer and supplier. */
function runEngine(buyerId: string, supplierId: string, startAt: string): Outcome {
  return negotiate({
    buyer: BUYER_PROFILES[buyerId],
    supplier: SUPPLIER_PROFILES[supplierId],
    buyerShort: BUSINESSES[buyerId].short,
    marketPerKg: PUBLIC.marketPerKg,
    maxMessages: MAX_MESSAGES,
    startAt,
  });
}

/** The activity-log rows a negotiation writes: each side's own moves and rule checks, then the result. */
function negotiationRows(o: Outcome, buyerId: string, supplierId: string): LogRow[] {
  const id = () => `r${Date.now()}${Math.random().toString(36).slice(2, 7)}`;
  const party = { buyer: buyerId, supplier: supplierId };
  const at0 = o.messages[0]?.at ?? "09:04";
  const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
  const verb = { offer: "Offered", counter: "Countered", accept: "Accepted" } as Record<string, string>;
  const rows: LogRow[] = [
    { id: id(), side: "buyer", kind: "agent", staffVisible: false, action: `Opened negotiation with ${BUSINESSES[supplierId].short}`, actor: `${wakilName(buyerId)} · agent`, reason: "Limits sealed, max not shared", at: at0 },
    { id: id(), side: "supplier", kind: "agent", staffVisible: false, action: `Joined negotiation with ${BUSINESSES[buyerId].name}`, actor: `${wakilName(supplierId)} · agent`, reason: `${BUYER_PROFILES[buyerId].qtyKg} kg weekly request`, at: at0 },
  ];
  for (const m of o.messages) {
    for (const r of o.rules.filter((r) => r.n === m.n)) {
      rows.push({ id: id(), side: r.side, kind: "rule", staffVisible: false, action: r.action, actor: "Rule check · system", reason: r.reason, at: m.at });
    }
    if (m.pricePerKg == null) continue;
    rows.push({ id: id(), side: m.side, kind: "agent", staffVisible: false, action: `${verb[m.type]} RM${m.pricePerKg.toFixed(2)}/kg`, actor: `${wakilName(party[m.side])} · agent`, reason: cap(m.why), at: m.at });
  }
  const last = o.messages[o.messages.length - 1];
  rows.push(
    o.result === "deal"
      ? { id: id(), side: "both", kind: "agent", staffVisible: false, action: `Deal proposed · ${o.messages.length} of ${MAX_MESSAGES} messages`, actor: `${wakilName(party[last.side])} · agent`, reason: cap(last.why), at: last.at }
      : { id: id(), side: "both", kind: "agent", staffVisible: false, action: `No deal · stopped at ${MAX_MESSAGES} messages`, actor: "SupplySwipe · system", reason: "Back to both owners", at: last.at },
  );
  return rows;
}

const dealFrom = (o: Outcome, buyerId: string, supplierId: string): Deal => ({
  id: DEAL_ID,
  negotiationId: NEGOTIATION_ID,
  buyerId,
  supplierId,
  status: "proposed",
  terms: o.terms!,
  approvals: [],
});

const fresh = (): Store => {
  // The demo starts with Aisyah's swipe on Ayam Segar already negotiated.
  const o = runEngine("mak-ngah", "ayam-segar", "09:04");
  return {
    deal: dealFrom(o, "mak-ngah", "ayam-segar"),
    negotiation: { buyerId: "mak-ngah", supplierId: "ayam-segar", messages: o.messages, result: o.result },
    log: [...initialLog(), ...negotiationRows(o, "mak-ngah", "ayam-segar")],
    // The seed already holds Aisyah's post and swipe, so repeating those steps adds no duplicates.
    logKeys: ["post:chicken", "swipe:buyer:ayam-segar"],
    wakil: { buyer: { ...DEFAULT_WAKIL.buyer }, supplier: { ...DEFAULT_WAKIL.supplier } },
    postedRequest: false,
  };
};

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

const nowHHMM = () => {
  const latest = load().log.reduce((m, r) => (r.at > m ? r.at : m), "09:20");
  const [h, mi] = latest.split(":").map(Number);
  const t = h * 60 + mi + 1;
  return `${String(Math.floor(t / 60) % 24).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`;
};

// ---------- Activity log (append-only) ----------

export async function log(row: Omit<LogRow, "id" | "at"> & { at?: string }, key?: string): Promise<void> {
  // Sent in the background: a tap never waits for the backend to store its log row.
  void send("POST", "/log", { ...row, key });

  const s = load();
  if (key && s.logKeys.includes(key)) return;
  if (key) s.logKeys.push(key);
  s.log.push({ ...row, id: `r${Date.now()}${Math.random().toString(36).slice(2, 6)}`, at: row.at ?? nowHHMM() });
  save();
}

/** Owners see every row for their side. Staff see only their own rows. */
export async function getLog(side: Side, role: Role): Promise<LogRow[]> {
  const remote = await json<LogRow[]>(await backend(`/log?side=${side}&role=${role}`));
  if (remote) return remote;

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

/** Public numbers anyone can see: buyer target, supplier list price, market price, MOQ, last week's price. */
export function publicNumbers() {
  return { ...PUBLIC };
}

export function business(id: string): Business {
  return BUSINESSES[id];
}

/** The two businesses in a deal. */
export function parties(deal: Pick<Deal, "buyerId" | "supplierId">) {
  return { buyer: BUSINESSES[deal.buyerId], supplier: BUSINESSES[deal.supplierId] };
}

/** Public prices around a deal: the supplier's list price, the buyer's target, market and last week. */
export function publicPrices(deal: Pick<Deal, "buyerId" | "supplierId">) {
  return {
    listPerKg: SUPPLIER_PROFILES[deal.supplierId]?.listPerKg ?? PUBLIC.supplierListPerKg,
    targetPerKg: BUYER_PROFILES[deal.buyerId]?.targetPerKg ?? PUBLIC.buyerTargetPerKg,
    marketPerKg: PUBLIC.marketPerKg,
    lastWeekPerKg: PUBLIC.lastWeekPerKg,
    onTime: SUPPLIER_PROFILES[deal.supplierId]?.onTime ?? "",
  };
}

/** Owner and staff names for one side of a deal. */
export function people(deal: Pick<Deal, "buyerId" | "supplierId">, side: Side) {
  const id = side === "buyer" ? deal.buyerId : deal.supplierId;
  const profile = side === "buyer" ? BUYER_PROFILES[id] : SUPPLIER_PROFILES[id];
  return { owner: BUSINESSES[id].owner, staff: profile?.staff ?? "Staff", staffTitle: profile?.staffTitle ?? "staff", short: BUSINESSES[id].short };
}

/** The last swipe that ended with no deal before the first message: who, and the public and own numbers. */
export function getNoDeal() {
  const nd = load().noDeal ?? { side: "buyer" as Side, counterpartId: "fresh-poultry" };
  const counterpart = BUSINESSES[nd.counterpartId];
  const theirsPerKg = nd.side === "buyer" ? SUPPLIER_PROFILES[nd.counterpartId].listPerKg : BUYER_PROFILES[nd.counterpartId].targetPerKg;
  const ownPerKg = nd.side === "buyer" ? BUYER_PROFILES[ME.buyer.businessId].maxPerKg : SUPPLIER_PROFILES[ME.supplier.businessId].floorPerKg;
  const others = (nd.side === "buyer" ? SUPPLIER_CARDS : BUYER_CARDS).filter((c) => c.id !== nd.counterpartId);
  return { side: nd.side, counterpart, theirsPerKg, ownPerKg, others: clone(others) };
}

/** Rule-based feed (no AI): buyers see suppliers, suppliers see buyer requests. */
export async function getFeed(side: Side): Promise<Counterpart[]> {
  const remote = await json<Counterpart[]>(await backend(`/feed?side=${side}`));
  return remote ?? clone(side === "buyer" ? SUPPLIER_CARDS : BUYER_CARDS);
}

export async function postRequest(): Promise<void> {
  await send("POST", "/requests");

  const s = load();
  s.postedRequest = true;
  await log(
    { side: "buyer", kind: "human", staffVisible: true, action: "Posted request · 50 kg chicken breast", actor: "Aisyah · kitchen lead", reason: "Weekly stock count", at: "09:02" },
    "post:chicken",
  );
}

/**
 * The trigger. Swiping right posts /negotiations. Returns the negotiation id to open.
 */
export async function startNegotiation(side: Side, counterpartId: string): Promise<{ id: string; noDeal: boolean }> {
  const remote = await json<{ id: string; noDeal: boolean }>(
    await send("POST", "/negotiations", { side, counterpartId }, NEGOTIATION_TIMEOUT_MS),
  );
  if (remote) {
    save();
    return remote;
  }

  const card = (side === "buyer" ? SUPPLIER_CARDS : BUYER_CARDS).find((c) => c.id === counterpartId);
  const who = side === "buyer" ? "Aisyah · kitchen lead" : "Sales rep · Ayam Segar";
  await log(
    { side, kind: "human", staffVisible: true, action: `Swiped right on ${card?.name.replace(" Enterprise", "") ?? counterpartId}`, actor: who, reason: card ? `${card.fit}% fit, ${card.why}` : "" },
    `swipe:${side}:${counterpartId}`,
  );

  // The swiper's own business on one side, the swiped card on the other.
  const buyerId = side === "buyer" ? ME.buyer.businessId : counterpartId;
  const supplierId = side === "buyer" ? counterpartId : ME.supplier.businessId;
  const s = load();
  const o = runEngine(buyerId, supplierId, nowHHMM());
  if (o.reason === "no_overlap") {
    s.noDeal = { side, counterpartId };
    await log({ side, kind: "agent", staffVisible: false, action: `No deal with ${BUSINESSES[counterpartId].short} · 0 messages`, actor: `${wakilName(side === "buyer" ? buyerId : supplierId)} · agent`, reason: "Their limit and yours don't overlap. Neither limit was shown." });
    return { id: NO_DEAL_ID, noDeal: true };
  }

  s.negotiation = { buyerId, supplierId, messages: o.messages, result: o.result };
  if (o.result === "deal") {
    s.deal = dealFrom(o, buyerId, supplierId);
    // A new deal: earlier approvals, asks and the sealed record belong to the old one.
    s.logKeys = s.logKeys.filter((k) => !/^(approve|sealed|memory|ask):/.test(k));
  }
  s.log.push(...negotiationRows(o, buyerId, supplierId));
  save();
  return { id: NEGOTIATION_ID, noDeal: false };
}

export async function skipCard(side: Side, counterpartId: string): Promise<void> {
  await send("POST", "/cards/skip", { side, counterpartId });

  const card = (side === "buyer" ? SUPPLIER_CARDS : BUYER_CARDS).find((c) => c.id === counterpartId);
  await log({ side, kind: "human", staffVisible: true, action: `Skipped ${card?.name ?? counterpartId}`, actor: side === "buyer" ? "Aisyah · kitchen lead" : "Sales rep · Ayam Segar", reason: card?.why ?? "" }, `skip:${side}:${counterpartId}`);
}

// ---------- Negotiation ----------

export async function getNegotiation(id: string, viewer: Side): Promise<NegotiationView> {
  const remote = await json<NegotiationView>(await backend(`/negotiations/${id}?viewer=${viewer}`));
  if (remote) return remote;

  const n = load().negotiation;
  const buyer = BUYER_PROFILES[n.buyerId];
  const supplier = SUPPLIER_PROFILES[n.supplierId];
  // Only the viewer's own sealed limit is in the view; the band's other end comes from public numbers.
  const own = viewer === "buyer" ? buyer.maxPerKg : supplier.floorPerKg;
  const band =
    viewer === "buyer"
      ? { lo: +(PUBLIC.marketPerKg - 0.3).toFixed(2), hi: own }
      : { lo: own, hi: +(buyer.targetPerKg - 0.5).toFixed(2) };
  const prices = [...n.messages.flatMap((m) => (m.pricePerKg != null ? [m.pricePerKg] : [])), band.lo, band.hi, PUBLIC.marketPerKg];
  return {
    id,
    viewer,
    buyerId: n.buyerId,
    supplierId: n.supplierId,
    item: "Chicken breast, skinless",
    qtyLabel: `${buyer.qtyKg} kg weekly`,
    marketPerKg: PUBLIC.marketPerKg,
    ownLimitPerKg: own,
    band,
    scale: { lo: Math.floor((Math.min(...prices) - 0.1) * 10) / 10, hi: Math.ceil((Math.max(...prices) + 0.1) * 10) / 10 },
    messages: clone(n.messages),
    maxMessages: MAX_MESSAGES,
    dealId: DEAL_ID,
    result: n.result,
  };
}

// ---------- Deal and approvals ----------

export async function getDeal(id: string): Promise<Deal> {
  const remote = await json<Deal>(await backend(`/deals/${id}`));
  return remote ?? clone(load().deal);
}

const ownerName = (side: Side) => people(load().deal, side).owner;
const actorLabel = (side: Side, role: Role) => {
  const p = people(load().deal, side);
  if (role === "owner") return side === "buyer" ? `${p.owner} · owner` : `${p.owner} · owner, ${p.short}`;
  return side === "buyer" ? `${p.staff} · ${p.staffTitle}` : `${p.staff} · ${p.short}`;
};

export function approvalLimit(side: Side, role: Role): number {
  return role === "owner" ? Infinity : ME[side].staffLimit;
}

export type ApproveResult = { ok: true; deal: Deal } | { ok: false; reason: "above_limit" | "already" | "rejected" };

export async function approve(dealId: string, side: Side, role: Role): Promise<ApproveResult> {
  const remote = await json<ApproveResult>(await send("POST", `/deals/${dealId}/approve`, { side, role }));
  if (remote) {
    save();
    return remote;
  }

  const s = load();
  const d = s.deal;
  if (d.status === "rejected") return { ok: false, reason: "rejected" };
  if (d.terms.weeklyTotal > approvalLimit(side, role)) return { ok: false, reason: "above_limit" };
  if (d.approvals.some((a) => a.side === side)) return { ok: false, reason: "already" };

  const at = role === "owner" ? (side === "buyer" ? SEALED_TIMES.buyerOwner : SEALED_TIMES.supplierOwner) : nowHHMM();
  const by = role === "owner" ? ownerName(side) : people(d, side).staff;
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
    await log({ side: "buyer", kind: "agent", staffVisible: false, action: "Saved memory", actor: `${wakilName(d.buyerId)} · agent`, reason: `${people(d, "supplier").short} takes ${pay(d.terms.paymentDays)}; trial until 5 Nov`, at }, `memory:${d.id}:buyer`);
  } else {
    d.status = side === "buyer" ? "buyer_approved" : "supplier_approved";
  }
  save();
  return { ok: true, deal: clone(d) };
}

export async function reject(dealId: string, side: Side, role: Role, reason: string): Promise<void> {
  // The backend writes its own log row, so stop there to avoid a duplicate.
  if ((await send("POST", `/deals/${dealId}/reject`, { side, role, reason }))?.ok) {
    save();
    return;
  }

  const s = load();
  s.deal.status = "rejected";
  await log({ side: "both", kind: "approval", staffVisible: role === "staff", action: "Rejected deal", actor: actorLabel(side, role), reason: reason || "No reason given" });
}

export async function askOwner(dealId: string, side: Side): Promise<string> {
  const remote = await json<{ at: string }>(await send("POST", `/deals/${dealId}/ask-owner`, { side, role: "staff" }));
  if (remote) {
    save();
    return remote.at;
  }

  const s = load();
  const at = side === "buyer" ? SEALED_TIMES.askedOwner : nowHHMM();
  s.deal.askedOwnerAt = at;
  await log({ side, kind: "human", staffVisible: true, action: `Asked ${ownerName(side)} to approve`, actor: actorLabel(side, "staff"), reason: `RM${s.deal.terms.weeklyTotal} is above the staff limit RM${ME[side].staffLimit}`, at }, `ask:${s.deal.id}:${side}`);
  return at;
}

export async function undoAskOwner(dealId: string, side: Side): Promise<void> {
  if ((await send("POST", `/deals/${dealId}/undo-ask-owner`, { side, role: "staff" }))?.ok) {
    save();
    return;
  }

  const s = load();
  s.deal.askedOwnerAt = undefined;
  s.logKeys = s.logKeys.filter((k) => k !== `ask:${s.deal.id}:${side}`);
  await log({ side, kind: "human", staffVisible: true, action: "Cancelled request to owner", actor: actorLabel(side, "staff"), reason: "Undo within the same minute" });
}

export async function counterViaWakil(dealId: string, side: Side, role: Role, note: string): Promise<void> {
  // The backend writes both log rows, so stop there to avoid duplicates.
  if ((await send("POST", `/deals/${dealId}/counter`, { side, role, note }))?.ok) {
    save();
    return;
  }

  await log({ side, kind: "human", staffVisible: role === "staff", action: "Sent a counter note to Wakil", actor: actorLabel(side, role), reason: note.slice(0, 80) });
  await log({ side, kind: "agent", staffVisible: false, action: "Resumed negotiation · up to 4 more messages", actor: `${load().wakil[side].name} · agent`, reason: "Your note guides wording. Limits stay sealed." });
}

// ---------- Wakil profile ----------

export async function getWakil(side: Side): Promise<WakilProfile> {
  const remote = await json<WakilProfile>(await backend(`/wakil/${side}`));
  return remote ?? clone(load().wakil[side]);
}

export async function saveWakil(side: Side, cfg: WakilProfile): Promise<void> {
  await send("PUT", `/wakil/${side}`, cfg);

  load().wakil[side] = clone(cfg);
  save();
}

export async function resetDemo(): Promise<void> {
  await send("POST", "/demo/reset");

  store = fresh();
  save();
}

// ---------- Own sealed limit ----------

/** The caller's own sealed limit: buyer maximum or supplier floor. Defaults to the demo's own business on that side. */
export async function getOwnLimit(side: Side, businessId: string = ME[side].businessId): Promise<number> {
  const remote = await json<number>(await backend(`/limits/own?side=${side}`));
  if (remote != null) return remote;
  return side === "buyer" ? BUYER_PROFILES[businessId].maxPerKg : SUPPLIER_PROFILES[businessId].floorPerKg;
}
