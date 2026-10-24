// Local mock data. All synthetic, matches the handoff README "Demo data" exactly.
// Only lib/api.ts should import this file. Screens read data through lib/api.ts.

import type { Business, Counterpart, Deal, LogRow, NegMessage, Terms, WakilProfile, Side } from "./types";

export const LOGO = {
  makNgah: "/logos/mak-ngah.png",
  ayamSegar: "/logos/ayam-segar.png",
  kampungPoultry: "/logos/kampung-poultry.png",
  freshPoultry: "/logos/fresh-poultry.png",
  sengHuat: "/logos/seng-huat.png",
  kakYah: "/logos/kak-yah.png",
  dapurCatering: "/logos/dapur-catering.png",
  lockup: "/logos/supplyswipe-lockup.png",
  icon: "/logos/supplyswipe-icon.png",
  mark: "/logos/supplyswipe-mark.png",
};

export const BUSINESSES: Record<string, Business> = {
  "mak-ngah": { id: "mak-ngah", name: "Restoran Mak Ngah", short: "Mak Ngah", owner: "Mak Ngah", logo: LOGO.makNgah, side: "buyer", location: "Petaling Jaya, Selangor" },
  "ayam-segar": { id: "ayam-segar", name: "Ayam Segar Enterprise", short: "Ayam Segar", owner: "Encik Roslan", logo: LOGO.ayamSegar, side: "supplier", location: "Shah Alam" },
  "kampung-poultry": { id: "kampung-poultry", name: "Kampung Poultry KL", short: "Kampung Poultry", owner: "Owner", logo: LOGO.kampungPoultry, side: "supplier", location: "Kepong" },
  "fresh-poultry": { id: "fresh-poultry", name: "Fresh Poultry Puchong", short: "Fresh Poultry", owner: "Owner", logo: LOGO.freshPoultry, side: "supplier", location: "Puchong" },
  "seng-huat": { id: "seng-huat", name: "Kedai Kopi Seng Huat", short: "Seng Huat", owner: "Owner", logo: LOGO.sengHuat, side: "buyer", location: "Subang" },
  "kak-yah": { id: "kak-yah", name: "Warung Kak Yah", short: "Kak Yah", owner: "Kak Yah", logo: LOGO.kakYah, side: "buyer", location: "Shah Alam" },
  "dapur-catering": { id: "dapur-catering", name: "Dapur Catering Sdn Bhd", short: "Dapur Catering", owner: "Owner", logo: LOGO.dapurCatering, side: "buyer", location: "Klang" },
};

/** Who is "me" on each side of the demo. */
export const ME: Record<Side, { businessId: string; owner: string; staff: string; staffTitle: string; staffLimit: number }> = {
  buyer: { businessId: "mak-ngah", owner: "Mak Ngah", staff: "Aisyah", staffTitle: "kitchen lead", staffLimit: 500 },
  supplier: { businessId: "ayam-segar", owner: "Encik Roslan", staff: "Sales rep", staffTitle: "sales rep", staffLimit: 300 },
};

/**
 * Sealed limits. In the real app these live only in the backend, per business, and are
 * stripped from every response sent to the other side. lib/api.ts reads one side at a time.
 */
export const SEALED_LIMITS: Record<Side, number> = {
  buyer: 12.5, // Mak Ngah's maximum, RM/kg
  supplier: 11.8, // Ayam Segar's floor, RM/kg
};

/** Public numbers anyone can see. */
export const PUBLIC = {
  buyerTargetPerKg: 13.0,
  supplierListPerKg: 12.8,
  marketPerKg: 12.1, // PriceCatcher
  moqKg: 30,
  lastWeekPerKg: 12.8, // what Mak Ngah paid last week, before SupplySwipe
};

export const NEGOTIATION_ID = "n-0142";
export const DEAL_ID = "SS-0142";
export const NO_DEAL_ID = "n-0139";

export const TRANSCRIPT: NegMessage[] = [
  { n: 1, side: "buyer", type: "ask", headline: "50 kg · Mon, Thu · PJ", text: "Can you deliver 50 kg skinless chicken breast to PJ every Mon and Thu? Lead time?", why: "request posted by Aisyah, kitchen lead", at: "09:04" },
  { n: 2, side: "supplier", type: "offer", pricePerKg: 12.8, headline: "RM12.80/kg", text: "Yes, next-day. RM12.80/kg, RM10 delivery, COD.", why: "list price, new buyer", at: "09:04" },
  { n: 3, side: "buyer", type: "counter", pricePerKg: 12.0, headline: "RM12.00/kg", text: "RM12.00/kg, free delivery, 14-day terms, standing weekly order.", why: "market RM12.10, 50 kg every week", at: "09:05" },
  { n: 4, side: "supplier", type: "counter", pricePerKg: 12.5, headline: "RM12.50/kg", text: "RM12.50/kg, delivery waived above 40 kg, 7-day terms.", why: "50 kg weekly clears MOQ 30 kg", at: "09:05" },
  { n: 5, side: "buyer", type: "counter", pricePerKg: 12.2, headline: "RM12.20/kg", text: "RM12.20/kg, 7-day terms, starting with a 2-week trial.", why: "market RM12.10, supplier on time 9 of 10", at: "09:05" },
  { n: 6, side: "supplier", type: "accept", pricePerKg: 12.2, headline: "RM12.20/kg", text: "Accepts RM12.20/kg, free delivery, 7-day terms, 2-week trial.", why: "volume covers delivery cost", at: "09:06" },
];

export const TERMS: Terms = {
  item: "Chicken breast, skinless, grade A",
  qtyKgWeekly: 50,
  days: ["Mon", "Thu"],
  before: "9am",
  pricePerKg: 12.2,
  deliveryRule: "Free delivery above 40 kg",
  paymentDays: 7,
  trialWeeks: 2,
  weeklyTotal: 610,
};

export const initialDeal = (): Deal => ({
  id: DEAL_ID,
  negotiationId: NEGOTIATION_ID,
  buyerId: "mak-ngah",
  supplierId: "ayam-segar",
  status: "proposed",
  terms: TERMS,
  approvals: [],
});

/** Seed log: everything that happened before the owners approve. Approvals are appended live. */
export const initialLog = (): LogRow[] => [
  { id: "l1", side: "buyer", kind: "human", staffVisible: true, action: "Posted request · 50 kg chicken breast", actor: "Aisyah · kitchen lead", reason: "Weekly stock count", at: "09:02" },
  { id: "l2", side: "buyer", kind: "human", staffVisible: true, action: "Swiped right on Ayam Segar", actor: "Aisyah · kitchen lead", reason: "92% fit, delivers PJ Mon–Sat", at: "09:04" },
  { id: "l3", side: "buyer", kind: "agent", staffVisible: false, action: "Opened negotiation", actor: "Wakil Mak Ngah · agent", reason: "Limits sealed, max not shared", at: "09:04" },
  { id: "l4", side: "buyer", kind: "rule", staffVisible: false, action: "Draft blocked · would reveal your maximum", actor: "Rule check · system", reason: "Rewritten before sending. No private value left the app.", at: "09:05" },
  { id: "l5", side: "buyer", kind: "agent", staffVisible: false, action: "Countered RM12.00/kg", actor: "Wakil Mak Ngah · agent", reason: "Market RM12.10, 50 kg every week", at: "09:05" },
  { id: "l6", side: "buyer", kind: "rule", staffVisible: false, action: "Offer blocked · RM12.60 is above your limit", actor: "Rule check · system", reason: "Wakil re-drafted inside your sealed max", at: "09:05" },
  { id: "l7", side: "buyer", kind: "agent", staffVisible: false, action: "Countered RM12.20/kg, 2-week trial", actor: "Wakil Mak Ngah · agent", reason: "Supplier on time 9 of 10", at: "09:05" },
  { id: "l8", side: "both", kind: "agent", staffVisible: false, action: "Deal proposed · 6 of 10 messages", actor: "Wakil Ayam Segar · agent", reason: "Volume covers delivery cost", at: "09:06" },
  // Supplier-side rows. The buyer never sees these.
  { id: "s1", side: "supplier", kind: "agent", staffVisible: false, action: "Joined negotiation with Restoran Mak Ngah", actor: "Wakil Ayam Segar · agent", reason: "Request is on the PJ Mon and Thu run", at: "09:04" },
  { id: "s2", side: "supplier", kind: "agent", staffVisible: false, action: "Countered RM12.50/kg", actor: "Wakil Ayam Segar · agent", reason: "50 kg weekly clears MOQ 30 kg", at: "09:05" },
  { id: "s3", side: "supplier", kind: "agent", staffVisible: false, action: "Accepted RM12.20/kg", actor: "Wakil Ayam Segar · agent", reason: "Volume covers delivery cost", at: "09:06" },
];

/** Rows written when the deal is sealed, in the order the S6 reference shows them. */
export const SEALED_TIMES = { buyerOwner: "09:11", supplierOwner: "09:20", askedOwner: "09:08" };

/** B2: suppliers for the buyer's chicken breast request. */
export const SUPPLIER_CARDS: Counterpart[] = [
  {
    id: "ayam-segar", name: "Ayam Segar Enterprise", logo: LOGO.ayamSegar, location: "Shah Alam · 14 km · 180 outlets", fit: 92,
    listLabel: "RM12.80/kg list", opensAt: "RM12.00", panel: "#D7F3EC", accent: "#0E8A76",
    tiles: [{ label: "On time", value: "9 of 10" }, { label: "Terms", value: "7 days" }, { label: "MOQ", value: "30 kg" }],
    chips: [{ label: "Within budget", tone: "ok" }, { label: "Delivers PJ Mon–Sat", tone: "ok" }, { label: "Halal", tone: "ok" }, { label: "MOQ 30 kg", tone: "ok" }, { label: "New to you", tone: "neutral" }],
    why: "on your Mon and Thu route, list under your target",
  },
  {
    id: "kampung-poultry", name: "Kampung Poultry KL", logo: LOGO.kampungPoultry, location: "Kepong · 22 km · 60 outlets", fit: 81,
    listLabel: "RM12.60/kg list", opensAt: "RM11.90", panel: "#FCEBCB", accent: "#E9A23B",
    tiles: [{ label: "On time", value: "8 of 10" }, { label: "Terms", value: "COD" }, { label: "MOQ", value: "20 kg" }],
    chips: [{ label: "Tue and Fri only", tone: "warn" }, { label: "Within budget", tone: "ok" }, { label: "Halal", tone: "ok" }, { label: "MOQ 20 kg", tone: "ok" }],
    why: "good price, but delivers Tue and Fri only",
  },
  {
    id: "fresh-poultry", name: "Fresh Poultry Puchong", logo: LOGO.freshPoultry, location: "Puchong · 11 km · 95 outlets", fit: 64,
    listLabel: "RM13.80/kg list", opensAt: "RM12.00", panel: "#E9E8F3", accent: "#6E6C86",
    tiles: [{ label: "On time", value: "10 of 10" }, { label: "Terms", value: "14 days" }, { label: "MOQ", value: "50 kg" }],
    chips: [{ label: "Above your budget", tone: "bad" }, { label: "Halal", tone: "ok" }, { label: "Delivers PJ daily", tone: "ok" }],
    why: "reliable, but list price is above your maximum",
  },
];

/** P2: buyer requests the supplier sees. */
export const BUYER_CARDS: Counterpart[] = [
  {
    id: "mak-ngah", name: "Restoran Mak Ngah", logo: LOGO.makNgah, location: "Petaling Jaya · halal · 40 seats", fit: 88,
    listLabel: "Target RM13.00/kg", opensAt: "RM12.80", panel: "#E6E3FF", accent: "#6A5CF0",
    tiles: [{ label: "Quantity", value: "50 kg/wk" }, { label: "Days", value: "Mon, Thu" }, { label: "Pays", value: "7 days" }],
    chips: [{ label: "50 kg weekly", tone: "ok" }, { label: "On your PJ route", tone: "ok" }, { label: "Pays 7 days", tone: "ok" }, { label: "New buyer", tone: "neutral" }],
    why: "on your Mon and Thu PJ run, clears MOQ 30 kg",
  },
  {
    id: "seng-huat", name: "Kedai Kopi Seng Huat", logo: LOGO.sengHuat, location: "Subang · kopitiam · 60 seats", fit: 74,
    listLabel: "Target RM13.20/kg", opensAt: "RM12.80", panel: "#FCEBCB", accent: "#E9A23B",
    tiles: [{ label: "Quantity", value: "20 kg/wk" }, { label: "Days", value: "Wed, Sat" }, { label: "Pays", value: "COD" }],
    chips: [{ label: "Below 40 kg · RM10 delivery", tone: "warn" }, { label: "On your Subang route", tone: "ok" }, { label: "COD", tone: "neutral" }],
    why: "on your route, small order pays delivery",
  },
  {
    id: "kak-yah", name: "Warung Kak Yah", logo: LOGO.kakYah, location: "Shah Alam · nasi campur · 30 seats", fit: 69,
    listLabel: "Target RM12.60/kg", opensAt: "RM12.80", panel: "#E9E8F3", accent: "#6E6C86",
    tiles: [{ label: "Quantity", value: "35 kg/wk" }, { label: "Days", value: "Daily" }, { label: "Pays", value: "14 days" }],
    chips: [{ label: "Daily drops", tone: "warn" }, { label: "Near your depot", tone: "ok" }, { label: "14-day terms", tone: "warn" }],
    why: "close to depot, but wants daily drops and 14 days",
  },
];

export const DEFAULT_WAKIL: Record<Side, WakilProfile> = {
  buyer: { name: "Wakil Mak Ngah", color: "purple", hat: "chef", face: "happy", lang: "mix", tone: "friendly", notes: "", lookNote: "" },
  supplier: { name: "Wakil Ayam Segar", color: "teal", hat: "cap", face: "focus", lang: "mix", tone: "friendly", notes: "", lookNote: "" },
};
