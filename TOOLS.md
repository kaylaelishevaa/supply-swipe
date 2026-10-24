# Technical & Tools Declaration (draft)

The source for `submission/SDC2026_<TeamName>_TechDeclaration.pdf`. It follows the official SDC Hackathon 2026 Technical & Tools Declaration template section by section, so each part can be copied into the PDF. Blank fields need the team. Personal contact details go in the PDF only, not in this public repo.

## 1. Team & Project Overview

| Field | Details |
|---|---|
| Team Name |  |
| Project / Solution Name | SupplySwipe (Wakil) |
| Name (Leader) |  |
| Email & Phone (Leader) | In the PDF only |
| University Affiliation(s) | Monash University Malaysia |
| Live Prototype URL |  |
| Code Repository URL | https://github.com/kaylaelishevaa/supply-swipe (public) |

## 2. Architecture & Technology Stack

### 2.1 System Architecture Overview

The user opens the Next.js web app, deployed on Replit, on a phone. Every read and write goes through one module (`lib/api.ts`), which calls the Python FastAPI backend and falls back to built-in synthetic data when the backend can't be reached; the hosted demo runs on that fallback. The backend runs the negotiation engine: two Wakil agents exchange at most 20 structured messages, and code checks each offer against the sender's own sealed limit. It also enforces staff approval limits, seals a deal only when both owners approve, and keeps an append-only activity log. Data is held in memory or, optionally, synced to Supabase Postgres. Optionally, the engine asks Claude Haiku 5.5 (Anthropic API) to draft each message as JSON; without it, a rule-based fallback produces the negotiation.

### 2.2 Languages, Frameworks & Libraries

| Name & Version | Purpose in Project | License |
|---|---|---|
| TypeScript 5.9.3 | Frontend language | Apache-2.0 |
| Python 3 | Backend language | PSF |
| Next.js 14.2.35 | Web framework (App Router) | MIT |
| React 18.3.1 / React DOM 18.3.1 | UI library | MIT |
| Tailwind CSS 3.4.19, PostCSS 8.5 | Styling | MIT |
| Recharts 3.10.1 | Price convergence chart | MIT |
| three.js 0.160.0 (r160, jsDelivr CDN) | Optional 3D Wakil agent; 2D fallback without WebGL | MIT |
| Plus Jakarta Sans, JetBrains Mono (Google Fonts via `next/font`) | Typography | SIL OFL 1.1 |
| ESLint 8.57 + eslint-config-next 14.2.35 | Linting | MIT |
| FastAPI ≥0.110 (tested 0.136.1) | Backend API | MIT |
| Uvicorn ≥0.28 (tested 0.47.0) | ASGI server | BSD-3-Clause |
| Pydantic ≥2.6 (tested 2.13.4) | Request and response models | MIT |
| supabase-py ≥2.3 | Optional database client | MIT |
| python-dotenv ≥1.0.1, httpx ≥0.27 | Config loading; test client | BSD-3-Clause |
| Anthropic Python SDK (optional, not in `requirements.txt`) | Calls Claude from the negotiation engine | MIT |

## 3. APIs & Cloud Services

### 3.1 External APIs

| API & Provider | Purpose in Project | Access Tier |
|---|---|---|
| Anthropic Messages API (Claude Haiku 5.5) | Optional: drafts each Wakil message in the backend negotiation engine. Off unless the `anthropic` package is installed and `ANTHROPIC_API_KEY` is set; the hosted demo does not call it |  |
| Supabase (Postgres API) | Optional: stores businesses, limits, negotiations, deals, approvals and the activity log |  |
| jsDelivr CDN | Serves three.js for the 3D agent | Free |
| Google Fonts | Fonts, downloaded at build time by `next/font` | Free |

### 3.2 Cloud Platforms & Deployment

| Service & Provider | Purpose in Project | Plan / Region |
|---|---|---|
| Replit (Replit Deployments) | Hosts the Next.js frontend: `npm install && npm run build && npm start` (see `.replit`) | Replit Core (sponsor-provided) |
| Supabase | Optional Postgres database (`backend/schema.sql`) |  |

The FastAPI backend runs locally (`uvicorn main:app --port 8000`) and is not deployed yet.

## 4. AI Tools, Models & Datasets

### 4.1 AI Models Used in the Solution

| Model & Version | Source / Provider | Usage | License / Terms |
|---|---|---|---|
| Claude Haiku 5.5 (`claude-haiku-5-5`) | Anthropic API | Pre-trained, called through the API; optional, with a rule-based fallback | Anthropic Commercial Terms of Service |

### 4.2 Datasets

| Dataset Name | Source / URL | Type | License | Personal Data? |
|---|---|---|---|---|
| SupplySwipe demo data (businesses, requests, listings, negotiation transcript, invoice) | `lib/mock.ts`, `backend/app/database.py`, `backend/schema.sql` | Synthetic (team-created) | Apache-2.0 (this repo) | N |
| DOSM PriceCatcher (format reference only; no data used) | https://data.gov.my | Public | CC BY 4.0 | N |

### 4.3 AI-Assisted Development Tools

Did the team use any generative-AI tool to help create code, design, text or other project material? **Yes.**

| Tool & Version | Used For | Extent of Use |
|---|---|---|
| Claude Code (Anthropic), model Claude Opus 5.5, with parallel sub-agents | Scaffolding the Next.js app and writing the frontend screens and components from the team's design handoff; later, reviewing the code, fixing bugs and updating the docs | Major |
| Claude (claude.ai design artifacts) | Hi-fi HTML design references in `design_handoff_supplyswipe/` (not shipped) | Moderate |
|  |  |  |

How the team reviewed, tested and took responsibility for AI-generated output (draft for the team to confirm):

> Team members reviewed every AI-generated change before committing it. The backend has an automated test suite (`backend/test_api.py`, 13 tests covering the rule checks, sealed limits, approvals and the activity log). The frontend is checked with TypeScript, ESLint and a production build, and every screen was run through the guided `/demo`. The team can explain and justify each component.

## 5. Sponsor-Provided Resources

Did the project use any official SDC sponsor-provided resource? **Yes.**

| Sponsor | Resource | How It Was Used in the Project |
|---|---|---|
| Replit | Replit Core (platform) | Hosts the live prototype with Replit Deployments |
| RunPod | US$25 credit | Not used: the project has no GPU work |

Was the sponsor resource essential, or could it be replaced?

> Replit hosts the live prototype that judges use. The app is a standard Next.js build with no Replit-specific code, so another Node host could replace it, but Replit is the required platform and the one we deploy on.

## 6. Security, Privacy & Responsible Use

### 6.1 Data Handling & Privacy

> No user data is collected. The prototype uses only team-created synthetic businesses, people, prices and messages. In the hosted demo, the demo state (deal, approvals, log, Wakil look) stays in the visitor's browser (`localStorage`). When the optional backend runs, the same synthetic data is held in memory or in the team's Supabase project. When the optional language model is on, the backend sends the Anthropic API one side's synthetic negotiation context: its own sealed limit, public prices and the messages so far. No API keys are in the repository; they live in a gitignored `.env`. A real deployment would follow Malaysia's PDPA principles (see the README).

### 6.2 Known Limitations & Risks

> The language model can return invalid JSON or an offer outside the sender's sealed limit. Code checks the price and message text against the sender's own limit, and a rule-based move replaces anything that fails or errors. The model's reason and headline fields are not yet checked for sealed values, so the next step is for code to pick every price and the model to write only the wording. The engine depends on one provider (Anthropic) but runs fully without it. There is no real sign-in yet: side and role come from the request, so sealed limits are enforced in the app, not per user. The hosted demo replays a fixed synthetic negotiation.

## 7. Compliance & Readiness Checklist

| | |
|---|---|
| ☐ | All APIs, cloud services, AI tools, models and datasets used in the project are declared in this document. *(fill the blank fields first)* |
| ☑ | All third-party code, datasets and models are used in accordance with their licenses, and attribution is provided where required. |
| ☑ | No API keys, passwords or other credentials are exposed in the code repository, prototype or this document. |
| ☐ | Any use of generative-AI tools for development has been disclosed and reviewed by the team. *(confirm 4.3)* |
| ☑ | Any use of official SDC sponsor resources has been declared in Section 5. |
| ☐ | The prototype described here is accessible to judges through the links provided in Section 1. *(add the Replit URL)* |
| ☐ | All fields in this template have been completed within the word limits stated. |
