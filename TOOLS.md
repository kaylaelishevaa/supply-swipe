# Tech and tools declaration (working list)

Kept up to date while building, for the SDC Hackathon 2026 Tech & Tools Declaration.

## AI tools used in development
| Tool | Used for |
|---|---|
| Claude Code (Anthropic, model Claude Opus 5.5, with parallel sub-agents) | Scaffolding the Next.js app and writing the frontend screens and components from the team's design handoff; later, reviewing the code, fixing bugs and updating these docs |
| Claude (claude.ai design artifacts) | Hi-fi HTML design references in `design_handoff_supplyswipe/` (not shipped) |

## Models called at runtime
| Model | Where | Status |
|---|---|---|
| Claude Haiku 5.5 (`claude-haiku-5-5`), Anthropic API | `backend/app/services/negotiation_engine.py`. Each Wakil drafts its next message as JSON (type, price, headline, text, reason), capped at 200 output tokens per message. Code checks the price and text against the sender's own sealed limit before the message is used. | Optional, off by default. It runs only when the backend has the `anthropic` package installed (it is not in `requirements.txt`) and `ANTHROPIC_API_KEY` set. Otherwise a rule-based fallback produces the same synthetic negotiation. The hosted Replit prototype runs the frontend only and never calls a model. |

## Frameworks and libraries
Frontend
- Next.js 14 (App Router), React 18, TypeScript
- Tailwind CSS 3
- Recharts 3 (price convergence chart)
- three.js r160 from jsDelivr CDN (3D Wakil agent, optional; 2D fallback without WebGL)
- Google Fonts via `next/font`: Plus Jakarta Sans, JetBrains Mono

Backend (`backend/`)
- Python, FastAPI, Uvicorn, Pydantic 2
- supabase-py (optional; without credentials the backend serves in-memory seed data)
- python-dotenv, httpx
- Anthropic Python SDK (optional, see above)

## Hosting and database
- Replit (compulsory) hosts the Next.js frontend: `npm install && npm run build && npm start`. When the backend can't be reached, the frontend uses its built-in synthetic data and `localStorage`, so the hosted demo runs on that.
- The FastAPI backend runs locally (`uvicorn main:app --port 8000`). It is not deployed yet.
- Supabase Postgres (optional): `backend/schema.sql` creates and seeds the tables.

## Data
All business names, people, prices and messages are synthetic. Market reference price is modelled on the public PriceCatcher dataset format; no real data is used in the prototype.
