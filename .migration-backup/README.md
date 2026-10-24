# SupplySwipe (Wakil)

> Two AI agents negotiate the weekly supply deal between a small F&B business and its supplier, inside each side's sealed price limit, and both owners approve the result with one tap.

An Orbyte module for small F&B businesses. Each business has a private AI agent, a **Wakil**, that negotiates the weekly supply deal with the other side's Wakil. The owners approve the result instead of haggling on WhatsApp. The prototype uses synthetic data only.

---

## Team Information

| Field | Details |
|---|---|
| **Team Name** | SupplySwipe |
| **Team Domain** | Domain 2 — Orbyte Smart SME Challenge: Less Busywork, Better Business |
| **SDG Track (1–17)** | SDG 8 — Decent Work and Economic Growth (primary; targets 8.2, 8.3). SDG 12 — Responsible Consumption and Production (secondary; target 12.3) |
| **Team Leader** | Kayla Elisheva Siwi |
| **University** | Monash University Malaysia |
| **Number of Members** | 4 |

## Links

| Resource | Link |
|---|---|
| GitHub Repository | https://github.com/kaylaelishevaa/supply-swipe |
| Live Demo (Replit) |  |
| Guided demo for judges | Live Demo link + `/demo` |
| Slide Deck |  |
| Demo Video (YouTube) |  |

---

## Overview

### Problem

Small cafés and restaurants renegotiate prices with three to eight suppliers almost every week, on WhatsApp: a price question, a counter, a delivery question, a phone call, then an invoice that does not match the chat. Suppliers repeat the same quote to dozens of leads. The burden is not ordering; it is negotiating and remembering what was agreed.

### Solution

Each business sets its limits once: a public target and a sealed maximum (buyer) or floor (supplier). A swipe right starts a negotiation between the two businesses' Wakils: at most 20 structured messages, with code checking every offer against the sender's own sealed limit. The deal stays a proposal until both owners approve, and staff can approve only under an owner-set limit. Approval pins the terms, opens a chat that cannot change them, checks the supplier's invoice against them, and writes every step to an append-only activity log.

### Key Features

- **One complete journey** — swipe right (trigger) → profiles, sealed limits and the market price (data) → two Wakils negotiate, every message rule-checked (decision) → both owners approve, staff only within their limit (human approval) → pinned terms, invoice check and activity log (outcome).
- **Sealed limits** — each side's maximum or floor is used only by its own Wakil and is never sent to the other side.
- **People stay in control** — owner and staff roles, a staff approval limit (RM500 buyer, RM300 supplier), "Ask owner to approve", and counter or reject with a reason.
- **Invoice check** — the supplier's invoice is compared line by line with the pinned terms before anyone pays.
- **Append-only activity log** — staff see their own actions; owners see everything, including drafts the rules blocked.
- **Easy to learn** — swipe cards, one teal Approve button, a plain-language reason on every offer, and a guided `/demo`.

### Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Recharts, three.js (optional 3D agent) |
| Backend | Python, FastAPI (negotiation engine, rule checks, approvals, activity log) |
| Database | Supabase Postgres (optional; in-memory seed data without it) |
| AI | Claude Haiku 5.5 through the Anthropic API (optional; rule-based fallback) |
| Hosting / Dev | Replit |

### Business benefit and SDG

Phase 2 targets from our proposal: 90% fewer owner messages per agreed deal (one approval instead of a WhatsApp thread), request to approved deal in under 5 minutes, 0 limit breaches in 50 test negotiations, and 100% of invoices compared with the pinned terms before payment. This supports SDG 8.3 (MSME productivity and growth), 8.2 (productivity through technology) and 12.3 (less food waste: quantities agreed against real need, invoices checked against agreed terms).

### Orbyte fit and reuse

SupplySwipe is built as an Orbyte module: business profiles, staff roles and limits come from the Orbyte hub (simulated here), and a sealed deal is saved back as a purchase order (simulated). The negotiation runs behind an API (`POST /negotiations`) that other Orbyte modules could call, and the same flow works for any recurring supply item and any pair of SMEs.

---

## How to Run

### Option 1 — Run on Replit (Recommended)

1. Import this repository into Replit (**Create Repl → Import from GitHub**).
2. Click **Run**. `.replit` runs `npm install && npm run build && npm start` and serves the app on port 3000. No secrets are needed.
3. Use **Deploy** for the public URL. Open `/demo` for the guided 20-step story.

### Option 2 — Run Locally

```bash
npm install
npm run dev            # http://localhost:3001
npm run build && npm start   # production; listens on 0.0.0.0:$PORT (default 3000)
```

The frontend needs no environment variables or API keys. In the browser, `lib/api.ts` first calls the FastAPI backend on port 8000 of the same host (or `NEXT_PUBLIC_API_URL`, if it is set to a non-localhost URL). If the backend can't be reached, every call falls back to the built-in synthetic data and `localStorage`. Replit deploys only the frontend, so the hosted demo always runs on that fallback.

The 3D Wakil loads three.js from jsDelivr. Offline, or without WebGL, every screen falls back to a 2D logo avatar.

### Backend (optional)

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Without Supabase credentials it serves in-memory seed data. See `backend/README.md` for Supabase setup and the optional Claude negotiation engine.

### Run Tests

```bash
cd backend && python test_api.py     # backend API tests
npm run lint && npx tsc --noEmit     # frontend lint and type check
```

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

## Project Structure

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
submission/     SDC2026_SupplySwipe_Preliminary.pdf and SDC2026_SupplySwipe_TechDeclaration.pdf
TOOLS.md        draft of the Technical & Tools Declaration, section by section
LICENSE         Apache License 2.0
```

### Architecture

```
Phone browser ──► Next.js app on Replit (screens, replay, rule checks for display)
                    │  lib/api.ts — falls back to built-in synthetic data if the backend is unreachable
                    ▼
                  FastAPI backend (negotiation engine, rule checks, approvals, activity log)
                    ├──► Supabase Postgres (optional)
                    └──► Anthropic API · Claude Haiku 5.5 (optional; rule-based fallback)
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

---

## How We Use Replit *(Required)*

- **Hosting:** the Next.js app is deployed with Replit Deployments at the Live Demo link above. `.replit` builds it with `npm install && npm run build` and serves it with `npm start` on port 3000.
- **Secrets:** the hosted frontend needs none. The backend reads its keys from `backend/.env`, which is gitignored and never committed.

Proof of use: the Replit deployment URL is given in the Technical & Tools Declaration (`submission/SDC2026_SupplySwipe_TechDeclaration.pdf`).

## How We Use RunPod

Not used. The handbook asks teams to use RunPod for work that needs a GPU (training, fine-tuning or GPU inference). SupplySwipe has none: the rule checks, feed and approvals run on CPU, and the optional language model is called through the Anthropic API. So there is no RunPod proof of use.

## Privacy and PDPA

The prototype uses only team-created synthetic data: no real people, businesses, prices or chats. In a real deployment we would apply Malaysia's PDPA principles as follows:

- **Notice, choice and purpose:** businesses agree to share only what a negotiation needs (items, quantities, delivery days, prices), and it is used only for that.
- **Disclosure:** a sealed limit is read only by its own business's Wakil. The language model gets that business's own limit and public numbers, never personal data.
- **Security:** real sign-in and roles, row-level security in Postgres, keys in secrets, and encryption in transit and at rest.
- **Retention, access and correction:** deal records and logs are kept for a period each business sets, and owners can see and correct their data.

## Hardest risk and fallback

- **A language model offering past a sealed limit or revealing it.** Code checks every offer and draft against the sender's own limit before it is used, and a rule-based move replaces anything that fails. The model can be switched off entirely and the negotiation still completes. Next step: code picks every price, and the model only writes the wording.
- **The backend or model being unavailable during a demo.** The frontend runs the whole journey on built-in synthetic data, which is what the hosted demo uses.

## Challenges & Learnings

- **Keeping sealed limits sealed:** every negotiation view is built per side, and the agreement band's far end is estimated from public numbers so the screen never encodes the other side's limit.
- **Bounded autonomy:** owners set limits once, agents work inside them, and a person approves every deal. We rejected both a chatbot (the owner would still be haggling) and full autonomy (owners won't let software commit their money).
- **Rules in code, language from the model:** ranking, validation and approvals in code keep cost and errors low and make the journey testable.

## Future Improvements

- [ ] Code picks every price; the model only writes the message text and reasons
- [ ] Check every field of a draft for sealed values, and log every blocked draft
- [ ] Deploy the backend next to the frontend on Replit, with keys in Replit Secrets
- [ ] Real sign-in and roles, so sealed limits and logs are enforced per user
- [ ] Wire the rule-based feed ranker into `/feed`, and stream messages with Supabase Realtime
- [ ] Resume the negotiation after "Counter via Wakil", using the owner's note and Wakil memory

## Team

| Name | Role | GitHub |
|---|---|---|
| Kayla Elisheva Siwi |  | [@kaylaelishevaa](https://github.com/kaylaelishevaa) |
| Shariq Nauman |  | [@ShariqNauman](https://github.com/ShariqNauman) |
| Darren Melvern |  | [@Darren772](https://github.com/Darren772) |
| Muhammad Ahmad |  |  |

---

## Submission Checklist

- [x] Team name, domain (Domain 2) and SDG track filled in
- [ ] Live demo (Replit) link added, and the Replit proof given in the Tech Declaration
- [ ] Slide deck link added
- [ ] Demo video link added (YouTube, 5–7 minutes)
- [x] RunPod not used (no GPU work), so no RunPod proof is needed
- [ ] `submission/SDC2026_SupplySwipe_Preliminary.pdf` added (official Submission Template)
- [ ] `submission/SDC2026_SupplySwipe_TechDeclaration.pdf` added (official template; see `TOOLS.md`)
- [ ] Committee's designated GitHub account(s) added as collaborators
- [x] Repository public, with the Apache License 2.0 `LICENSE`
- [ ] "How to Run" steps verified on Replit
- [x] No API keys or secrets committed

## License

This project is licensed under the [Apache License 2.0](LICENSE). AI tools and libraries used are listed in `TOOLS.md`. The design references live outside this repo, in the team's handoff folder.
