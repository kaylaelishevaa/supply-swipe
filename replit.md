# SupplySwipe

Procurement prototype for food businesses: buyer and supplier Wakil agents negotiate weekly supply deals, and both owners approve before a deal is sealed.

## Run and verify

- Web workflow: `artifacts/supplyswipe: web`.
- API scaffold workflow: `artifacts/api-server: API Server`.
- `pnpm --filter @workspace/supplyswipe run typecheck`
- `pnpm run test:e2e` — Playwright route coverage and negotiation/approval journey. Requires the web workflow running.
- The frontend uses Vite, React, wouter and the original Tailwind 3 configuration.

## Imported app behavior

The imported Vercel frontend works independently using its existing localStorage store, seeded businesses and rule-based negotiation engine. This remains a synthetic-data prototype, not a production authenticated procurement service.

The optional original Python FastAPI/Supabase backend remains in `.migration-backup/backend/`; it is not the Express scaffold and is not running. No database was migrated or replaced. Set `VITE_API_URL` to a separately hosted original backend only when needed. With no configured backend, the app uses its original persistent local demo without making requests to an unexposed port.

## Routing and assets

All original page paths are preserved, including `/demo`, dynamic negotiation/deal routes and `?view=desktop`. Pages live under `artifacts/supplyswipe/src/app`; `App.tsx` maps them to client routes. Original logos and the Wakil web component are in `public/`. The original 2D avatar fallback remains for devices without WebGL.

## Tests

Playwright uses `REPLIT_PLAYWRIGHT_CHROMIUM_EXECUTABLE` when available. Browser downloads are not needed in Replit. Test outputs go under ignored `generated-artifacts/`.
