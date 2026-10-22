// Shared types. This is the contract with the FastAPI + Supabase backend:
// the backend must return these exact shapes from the endpoints wrapped in lib/api.ts.

export type Side = "buyer" | "supplier";
export type Role = "owner" | "staff";
export type MsgType = "ask" | "offer" | "counter" | "accept" | "walk_away";

export interface NegMessage {
  n: number;
  side: Side;
  type: MsgType;
  pricePerKg?: number;
  /** Bold headline shown above the text, e.g. "RM12.80/kg" or "50 kg · Mon, Thu · PJ". */
  headline: string;
  text: string;
  why: string;
  at: string;
}

export interface Terms {
  item: string;
  qtyKgWeekly: number;
  days: string[];
  before: string;
  pricePerKg: number;
  deliveryRule: string;
  paymentDays: number;
  trialWeeks?: number;
  weeklyTotal: number;
}

export type DealStatus = "proposed" | "buyer_approved" | "supplier_approved" | "sealed" | "rejected";

export interface Approval {
  by: string;
  side: Side;
  role: Role;
  at: string;
}

export interface Deal {
  id: string;
  negotiationId: string;
  buyerId: string;
  supplierId: string;
  status: DealStatus;
  terms: Terms;
  approvals: Approval[];
  /** Set by the staff "Ask owner to approve" button. */
  askedOwnerAt?: string;
  poNumber?: string;
}

export type LogKind = "human" | "agent" | "approval" | "rule";

export interface LogRow {
  id: string;
  kind: LogKind;
  action: string;
  actor: string;
  reason: string;
  at: string;
  /** Staff only see rows they caused themselves. */
  staffVisible: boolean;
  /** Whose log this row belongs to. "both" rows (approvals, the deal record) show on both sides. */
  side: Side | "both";
}

export type WakilColor = "purple" | "plum" | "indigo" | "teal";
export type WakilHat = "chef" | "songkok" | "cap" | "headset" | "none";
export type WakilFace = "happy" | "focus" | "calm";

export interface WakilProfile {
  name: string;
  color: WakilColor;
  hat: WakilHat;
  face: WakilFace;
  lang: "en" | "bm" | "mix";
  tone: "friendly" | "formal";
  /** Free-text notes. They go into the wording prompt only and never change prices or limits. */
  notes: string;
  lookNote: string;
}

export type ChipTone = "ok" | "warn" | "bad" | "neutral";

export interface Counterpart {
  id: string;
  name: string;
  logo: string;
  location: string;
  fit: number;
  chips: { label: string; tone: ChipTone }[];
  tiles: { label: string; value: string }[];
  why: string;
  /** Public list price shown on the card panel, e.g. "RM12.80/kg list". */
  listLabel: string;
  /** Soft panel colour behind the logo on the swipe card. */
  panel: string;
  /** Strong accent colour for the card (fit ring stays teal). */
  accent: string;
  /** Public opening offer the Wakil would make, e.g. "RM12.00". */
  opensAt: string;
}

export interface Business {
  id: string;
  name: string;
  short: string;
  owner: string;
  logo: string;
  side: Side;
  location: string;
}

/**
 * What one side is allowed to see of a negotiation. The backend builds this per viewer
 * and must never put the counterpart's sealed limit in it.
 */
export interface NegotiationView {
  id: string;
  viewer: Side;
  buyerId: string;
  supplierId: string;
  item: string;
  qtyLabel: string;
  marketPerKg: number;
  /** The viewer's own sealed limit (buyer max or supplier floor). Only ever the viewer's own. */
  ownLimitPerKg: number;
  /**
   * The shaded "zone of possible agreement" in rail coordinates. One end is the viewer's own limit,
   * the other is estimated from public data (market price, public target), so it never encodes the
   * counterpart's sealed limit. It is drawn without numeric ends.
   */
  band: { lo: number; hi: number };
  /** Rail scale (RM/kg) used by PriceRail and the chart. */
  scale: { lo: number; hi: number };
  messages: NegMessage[];
  maxMessages: number;
  dealId: string;
  result: "deal" | "no_deal";
}
