# SupplySwipe (Wakil)

An Orbyte module for small F&B businesses. Each business has a private AI agent, a **Wakil**, that negotiates the weekly supply deal with the other side's Wakil. The owners approve the result instead of haggling on WhatsApp.

SDC Hackathon 2026 · Domain 2 (Orbyte Smart SME Challenge). The prototype uses synthetic data only.

**The journey:** swipe right (trigger) → profiles, sealed limits and the market price (data) → two Wakils, at most 10 validated messages (decision) → both owners approve, staff only within their limit (human approval) → deal record, pinned terms and invoice check (outcome) → append-only activity log.

## Run it

```bash
npm install
npm run dev            # http://localhost:3000
npm run build && npm start   # production; listens on 0.0.0.0:$PORT (default 3000)
```

On **Replit**, import the repo and press Run. `.replit` builds the app and serves it on port 3000. Use Deploy to get the public URL.

The app needs no environment variables or API keys. The 3D Wakil loads three.js from jsDelivr. Offline, or without WebGL, every screen falls back to a 2D logo avatar.

## Where to start

| URL | What |
|---|---|
| `/demo` | Guided 20-step story with captions, built from the real screens (use this for the video and the judges) |
| `/onboarding` | Start of the main path: S1 → S2a → S2 → B1 → B2 → S3 → N1 → S4 → P3 → S8 → S5 → S6 |
| `/negotiation/n-0142` | The hero screen. Add `?view=desktop` for the 1280 layout |

The demo state (deal, approvals, log, Wakil look) is kept in `localStorage`. Open `/demo` and go to step 1 to reset it.

## Screens

| ID | Route | Notes |
|---|---|---|
| S1 | `/onboarding` | Profile pre-filled from Orbyte |
| S2a | `/onboarding/wakil` | 3D preview; look and personality save instantly |
| S2 | `/onboarding/limits` | Target (public) and sealed maximum |
| B1 | `/requests/new` | Posted by Aisyah (staff) |
| B2 / P2 | `/feed` | Swipe deck; buyer sees suppliers, supplier sees buyer requests |
| S3 | `/negotiation/[id]` | 1.5s replay, price rail, chart, approval sheet |
| N1 | `/notify` | Lock-screen notification |
| S4 / S4s / P3 | `/approve/[id]` | Picked by side and role: owner sheet, staff above limit, supplier inbox |
| S4b | `/approve/[id]/counter` | Counter via Wakil (up to 4 more messages) |
| S8 | `/deal/[id]/sealed` | Only after both owners approve |
| S5 | `/deal/[id]` | Pinned terms and chat |
| I1 | `/deal/[id]/invoice` | Invoice compared with the pinned terms |
| S6 | `/log` | Append-only; staff see only their own rows |
| S7 | `/no-deal/[id]` | Floor above max, 0 tokens used |
| B3 | `/history/[supplierId]` | Week 3, renegotiate with memory |
| P1 | `/listings` | Supplier items and sealed floors (supplier side only) |

## Code map

```
app/            one folder per route (see table above), layout.tsx = fonts + DemoProvider + phone frame
components/     one file per UI component (Button, Chip, PriceRail, ConvergenceChart, SwipeDeck3D, ...)
lib/types.ts    shared types = the backend contract
lib/mock.ts     synthetic demo data (only lib/api.ts imports it)
lib/api.ts      every read and write; swap the bodies for fetch() to use the real backend
lib/negotiation.ts  replay hook, rail maths, rule checks (offer within own limit, no private value in a draft)
lib/demo-context.tsx  side (buyer | supplier) and role (owner | staff); no real auth
public/wakil-agent.js 3D agent web component (three.js), wrapped by components/Wakil.tsx with a 2D fallback
```

## Rules the code keeps

- **Sealed limits never leave their side.** `api.getNegotiation(id, viewer)` returns only the viewer's own limit. The agreement band's other end is estimated from public numbers (market −RM0.30, or public target −RM0.50), and the band is drawn without numeric ends. The real backend must strip the counterpart's limit server-side in the same way.
- **Teal is only for a human Approve tap.** Ink is for other primary actions; purple-soft is for actions that send a Wakil.
- **A deal is sealed only when both sides approve.** Staff can approve up to RM500 (buyer) and the sales rep up to RM300 (supplier). Above that, Approve is locked and "Ask Mak Ngah to approve" sends one notification.
- **Every state change writes a log row** through `api.log()`. The log is append-only.
- **Wakil notes (S2a) change wording only.** They never change prices or limits.

## Backend contract (for the FastAPI + Supabase side)

Return the shapes in `lib/types.ts`. Suggested endpoints, one per function in `lib/api.ts`:

| `lib/api.ts` | Endpoint |
|---|---|
| `getFeed(side)` | `GET /feed?side=` → `Counterpart[]` (rule-based ranking, no AI) |
| `postRequest()` | `POST /requests` |
| `startNegotiation(side, counterpartId)` | `POST /negotiations` → `{ id, noDeal }` (the trigger) |
| `getNegotiation(id, viewer)` | `GET /negotiations/:id?viewer=` → `NegotiationView` (**own limit only**); messages later stream over Supabase realtime into `useNegotiationReplay` |
| `getDeal(id)` | `GET /deals/:id` → `Deal` |
| `approve(id, side, role)` | `POST /deals/:id/approve` → enforces staff limits, seals on the second approval |
| `reject`, `askOwner`, `undoAskOwner`, `counterViaWakil` | `POST /deals/:id/{reject,ask-owner,counter}` |
| `log(row)`, `getLog(side, role)` | `POST /log`, `GET /log?side=&role=` (append-only, staff filter server-side) |
| `getWakil(side)`, `saveWakil(side, cfg)` | `GET/PUT /wakil/:side` |
| `getOwnLimit(side)` | `GET /limits/own?side=` (the caller's own limit only) |

## Licence and tools

Apache-2.0, see `LICENSE`. AI tools and libraries used are listed in `TOOLS.md`. The design references live outside this repo, in the team's handoff folder.
