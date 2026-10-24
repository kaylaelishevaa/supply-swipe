# SupplySwipe (Wakil)

An Orbyte module for small F&B businesses. Each business has a private AI agent, a **Wakil**, that negotiates the weekly supply deal with the other side's Wakil. The owners approve the result instead of haggling on WhatsApp.

SDC Hackathon 2026 · Domain 2 (Orbyte Smart SME Challenge). The prototype uses synthetic data only.

**The journey:** swipe right (trigger) → profiles, sealed limits and the market price (data) → two Wakils, at most 10 validated messages (decision) → both owners approve, staff only within their limit (human approval) → deal record, pinned terms and invoice check (outcome) → append-only activity log.

## Run it

```bash
npm install
npm run dev            # http://localhost:3001
npm run build && npm start   # production; listens on 0.0.0.0:$PORT (default 3000)
```

On **Replit**, import the repo and press Run. `.replit` builds the app and serves it on port 3000. Use Deploy to get the public URL.

The frontend needs no environment variables or API keys. In the browser, `lib/api.ts` first calls the FastAPI backend on port 8000 of the same host (or `NEXT_PUBLIC_API_URL`, if it is set to a non-localhost URL). If the backend can't be reached, every call falls back to the built-in synthetic data and `localStorage`. Replit deploys only the frontend, so the hosted demo always runs on that fallback.

The 3D Wakil loads three.js from jsDelivr. Offline, or without WebGL, every screen falls back to a 2D logo avatar.

### Backend (optional)

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Without Supabase credentials it serves in-memory seed data. See `backend/README.md` for Supabase setup, the optional Claude negotiation engine and the tests.

## Where to start

| URL | What |
|---|---|
| `/demo` | Guided 20-step story with captions, built from the real screens (use this for the video and the judges) |
| `/onboarding` | Start of the main path: S1 → S2a → S2 → B1 → B2 → S3 → N1 → S4 → P3 → S8 → S5 → S6 |
| `/negotiation/n-0142` | The hero screen. Add `?view=desktop` for the 1280 layout |

The demo state (deal, approvals, log, Wakil look) is kept in `localStorage`, or on the backend when it is running. Open `/demo` and go to step 1 to reset it.

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
| S4b | `/approve/[id]/counter` | Counter via Wakil; the note is logged (the resumed messages are not built yet) |
| S8 | `/deal/[id]/sealed` | Only after both owners approve |
| S5 | `/deal/[id]` | Pinned terms and chat |
| I1 | `/deal/[id]/invoice` | Invoice compared with the pinned terms |
| S6 | `/log` | Append-only; staff see only their own rows |
| S7 | `/no-deal/[id]` | Floor above max, 0 tokens used |
| B3 | `/history/[supplierId]` | Week 3, renegotiate with memory (replays the S3 negotiation) |
| P1 | `/listings` | Supplier items and sealed floors (supplier side only) |

## Code map

```
app/            one folder per route (see table above), layout.tsx = fonts + DemoProvider + phone frame
components/     one file per UI component (Button, Chip, PriceRail, ConvergenceChart, SwipeDeck3D, ...)
lib/types.ts    shared types = the backend contract
lib/mock.ts     synthetic demo data: the offline fallback for lib/api.ts, plus ids and logos some screens read
lib/api.ts      every read and write; calls the backend, falls back to lib/mock.ts + localStorage
lib/negotiation.ts  replay hook, rail maths, rule checks (offer within own limit, no private value in a draft)
lib/demo-context.tsx  side (buyer | supplier) and role (owner | staff); no real auth
public/wakil-agent.js 3D agent web component (three.js), wrapped by components/Wakil.tsx with a 2D fallback
backend/        FastAPI app: routers, in-memory store with optional Supabase sync, negotiation engine, tests
```

## Rules the code keeps

- **Sealed limits never leave their side.** `api.getNegotiation(id, viewer)` returns only the viewer's own limit. The agreement band's other end is estimated from public numbers (market −RM0.30, or public target −RM0.50), and the band is drawn without numeric ends. The backend builds the same view server-side. There is no real auth yet, so the viewer's side comes from the request.
- **Teal is only for a human Approve tap.** Ink is for other primary actions; purple-soft is for actions that send a Wakil.
- **A deal is sealed only when both sides approve.** Staff can approve up to RM500 (buyer) and the sales rep up to RM300 (supplier). Above that, Approve is locked and "Ask Mak Ngah to approve" sends one notification.
- **Every state change writes a log row.** Backend endpoints write their own rows; `api.log()` covers screens with no endpoint of their own. The log is append-only.
- **Wakil notes (S2a) are for wording only.** They never change prices or limits. They are saved with the profile; the negotiation engine does not read them yet.

## Backend API

The FastAPI backend in `backend/` implements these endpoints and returns the shapes in `lib/types.ts`:

| `lib/api.ts` | Endpoint |
|---|---|
| `getFeed(side)` | `GET /feed?side=` → `Counterpart[]` (seeded cards; the rule-based ranker in `backend/app/services/feed_ranker.py` is tested but not wired in yet) |
| `postRequest()` | `POST /requests` |
| `startNegotiation(side, counterpartId)` | `POST /negotiations` → `{ id, noDeal }` (the trigger; runs the negotiation engine) |
| `skipCard(side, counterpartId)` | `POST /cards/skip` |
| `getNegotiation(id, viewer)` | `GET /negotiations/:id?viewer=` → `NegotiationView` (**own limit only**); the frontend replays the returned messages (Supabase Realtime is not wired yet) |
| `getDeal(id)` | `GET /deals/:id` → `Deal` |
| `approve(id, side, role)` | `POST /deals/:id/approve` → enforces staff limits, seals on the second approval |
| `reject`, `askOwner`, `undoAskOwner`, `counterViaWakil` | `POST /deals/:id/{reject,ask-owner,undo-ask-owner,counter}` |
| `log(row)`, `getLog(side, role)` | `POST /log`, `GET /log?side=&role=` (append-only, staff filter server-side) |
| `getWakil(side)`, `saveWakil(side, cfg)` | `GET/PUT /wakil/:side` |
| `getOwnLimit(side)` | `GET /limits/own?side=` (the caller's own limit only) |
| `resetDemo()` | `POST /demo/reset` |

## Licence and tools

Apache-2.0, see `LICENSE`. AI tools and libraries used are listed in `TOOLS.md`. The design references live outside this repo, in the team's handoff folder.
