# Tech and tools declaration (working list)

Kept up to date while building, for the SDC Hackathon 2026 Tech & Tools Declaration.

## AI tools used in development
| Tool | Used for |
|---|---|
| Claude Code (Anthropic, model Claude Opus 5.5) | Scaffolding the Next.js app and writing frontend components from the team's design handoff |
| Claude (claude.ai design artifacts) | Hi-fi HTML design references in `design_handoff_supplyswipe/` (not shipped) |

## Models called at runtime
| Model | Where | Status |
|---|---|---|
| None yet | The prelim prototype replays a fixed, synthetic negotiation. Wording by an LLM will be added on the backend (FastAPI) and listed here. | — |

## Frameworks and libraries
- Next.js 14 (App Router), React 18, TypeScript
- Tailwind CSS 3
- Recharts (price convergence chart)
- three.js r149/r160 from jsDelivr CDN (3D Wakil agent, optional; 2D fallback without WebGL)
- Google Fonts via `next/font`: Plus Jakarta Sans, JetBrains Mono

## Hosting
- Replit (compulsory): `npm install && npm run build && npm start`

## Data
All business names, people, prices and messages are synthetic. Market reference price is modelled on the public PriceCatcher dataset format; no real data is used in the prototype.
