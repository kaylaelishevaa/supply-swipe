# SupplySwipe (Wakil)

> Two Wakils negotiate a weekly supply deal between a small food business and its supplier, within each side’s sealed price limit. Both owners approve before the deal is sealed.

SupplySwipe is an Orbyte procurement prototype for small F&B businesses. It uses synthetic demo data; it is not a live procurement service.

## Team

| Field | Details |
| --- | --- |
| **Team name** | SupplySwipe |
| **Team domain** | Domain 2 — Orbyte Smart SME Challenge: Less Busywork, Better Business |
| **SDG track** | SDG 8 — Decent Work and Economic Growth (primary); SDG 12 — Responsible Consumption and Production (secondary) |
| **Team leader** | Kayla Elisheva Siwi |
| **University** | Monash University Malaysia |
| **Team size** | 4 |

## Links

| Resource | Link |
| --- | --- |
| GitHub repository | [kaylaelishevaa/supply-swipe](https://github.com/kaylaelishevaa/supply-swipe) |
| SupplySwipe app | [Open the published app](https://supply-swipe--shariqnaumann.replit.app/) |
| Guided demo | [Open the 20-step demo](https://supply-swipe--shariqnaumann.replit.app/demo) |
| Pitch deck | [Open the SupplySwipe pitch deck](https://supply-swipe--shariqnaumann.replit.app/supplyswipe-pitch-deck/) |
| Pitch/demo video | **URL pending.** Add the public YouTube or video link here when one is available. |
| Public Replit deployment URL | [supply-swipe--shariqnaumann.replit.app](https://supply-swipe--shariqnaumann.replit.app/) |

## What it does

Each business sets a public target and a private maximum (buyer) or floor (supplier). Swiping right starts a negotiation between the businesses’ Wakils. The demo shows sealed limits, rule-checked offers, owner and staff approval paths, pinned deal terms, an invoice comparison, and an activity log.

Key screens include onboarding and Wakil customization, supply requests, a buyer/supplier feed, negotiation replay, approvals, sealed deals, deal chat, invoice checks, history, listings, and the guided `/demo`.

**Prototype boundaries:** the frontend uses seeded synthetic data and a local browser store. There is no real sign-in or live business data. The optional original Python service is retained under `.migration-backup/backend/` and is not started by the Replit workflows. The demo does not require database credentials.

## How to run

### In Replit

1. Open this project in Replit.
2. Select the **SupplySwipe** web app workflow and click **Run**.
3. Open the preview at `/`; visit `/demo` for the guided walkthrough.
4. The public deployment is [available here](https://supply-swipe--shariqnaumann.replit.app/). The guided demo is available at `/demo`.

The main workflow runs:

```bash
pnpm --filter @workspace/supplyswipe run dev
```

### Locally

Install Node.js 24 and pnpm, then run:

```bash
pnpm install
pnpm --filter @workspace/supplyswipe run dev
```

The app uses the workspace-provided `PORT` and `BASE_PATH` when started through its Replit workflow. To build the production frontend locally:

```bash
PORT=18383 BASE_PATH=/ NODE_ENV=production \
  pnpm --filter @workspace/supplyswipe run build
```

There is no required `.env` file or API key for the local demo. The optional FastAPI backend is separate and requires its own setup; see [`backend/README.md`](.migration-backup/backend/README.md).

### Checks

```bash
pnpm --filter @workspace/supplyswipe run typecheck
pnpm run test:e2e
```

The Playwright browser test uses Replit’s environment-provided Chromium when available.

## Project structure

```text
artifacts/
  supplyswipe/                Replit web artifact: Vite + React app
    src/app/                  Preserved app routes and page screens
    src/components/           Shared UI, approval, navigation and Wakil components
    src/lib/                  Demo store, rule-based negotiation and types
    public/                   App logos and optional 3D Wakil web component
  api-server/                 Replit Express API scaffold (not the imported demo API)
  supplyswipe-pitch-deck/     Separate Replit slides artifact
.migration-backup/
  backend/                    Original optional FastAPI/Supabase backend
  app/, components/, lib/     Preserved Vercel/Next.js source backup
  submission/                 Original submission documents
lib/                          Shared pnpm workspace packages
tests/                        Playwright end-to-end checks
```

The web app is a client-rendered Vite/React application. `artifacts/supplyswipe/src/App.tsx` maps the preserved route pages to client-side routes. The demo’s rule-based negotiation and localStorage-backed state keep the prototype usable without the optional backend. Original logos and the Wakil web component are served from the web artifact’s `public/` directory; the 2D Wakil avatar remains available when 3D rendering is unavailable.

## How we used Replit

- Imported the Vercel project into a pnpm workspace and ported its Next.js routes to a Vite + React web artifact.
- Use the Replit **SupplySwipe** workflow to run the app and the preview to explore the original flows.
- The app is publicly published at [supply-swipe--shariqnaumann.replit.app](https://supply-swipe--shariqnaumann.replit.app/).
- A separate SupplySwipe pitch-deck artifact is included in this workspace.
- The imported project includes synthetic demo data only. Replit hosting does not make its demo data a live shared business database.

## How we used RunPod

**RunPod was not used.** The prototype has no training, fine-tuning, or GPU inference workload: the included demo negotiation rules run in the browser on CPU. No RunPod resources or RunPod credentials are required.

## License

The imported project includes an [Apache License 2.0](.migration-backup/LICENSE).
