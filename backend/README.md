# SupplySwipe (Wakil) - Python FastAPI + Supabase Backend

Autonomous negotiation & procurement backend for SME F&B businesses (SDC Hackathon 2026).

---

## 1. Quick Start

### 1.1 Install & Run Server
From the `backend/` directory:

```bash
python -m venv .venv
# Windows PowerShell: .\.venv\Scripts\Activate.ps1    macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env        # optional: Supabase and Anthropic settings
uvicorn main:app --reload --port 8000
```

Or using python directly:
```bash
python main.py
```

Without Supabase credentials the backend serves in-memory seed data. A restart or `POST /demo/reset` puts it back to the start of the demo.

The API will be live at:
- **API Base**: `http://localhost:8000`
- **Swagger Documentation**: `http://localhost:8000/docs`
- **Interactive Redoc**: `http://localhost:8000/redoc`
- **Health Check**: `http://localhost:8000/health`

### 1.2 Optional: Claude negotiation engine
`POST /negotiations` runs `app/services/negotiation_engine.py`. When the `anthropic` package is installed (`pip install anthropic`; it is not in `requirements.txt`) and `ANTHROPIC_API_KEY` is set, the two Wakils draft their messages with `claude-haiku-5-5`. Otherwise a rule-based fallback produces a scripted transcript. Without the backend, the frontend generates each negotiation itself with `lib/engine.ts`.

Without Supabase, `GET /negotiations/:id` still returns the seeded transcript, while the deal terms take the engine's result.

### 1.3 Tests
```bash
python test_api.py
```

If `.env` has Supabase credentials, the tests run against that project: they reset deal `SS-0142` and append log rows there. To test in memory only, set `SUPABASE_URL` in `.env` back to the placeholder from `.env.example` first.

---

## 2. Supabase Setup (Database)

1. Open your project on [Supabase Dashboard](https://supabase.com).
2. Go to **SQL Editor** -> **New Query**.
3. Copy the entire contents of [`backend/schema.sql`](./schema.sql) and press **Run**.
   - This creates all tables (`businesses`, `wakil_profiles`, `sealed_limits`, `counterparts`, `negotiations`, `deals`, `activity_logs`, etc.).
   - It also pre-seeds the demo dataset (`Restoran Mak Ngah`, `Ayam Segar Enterprise`, feed cards, negotiation rounds, and initial logs).
4. Go to **Project Settings** -> **API**:
   - Copy **Project URL**
   - Copy the **service_role** key (server-side only). With the **anon** key, row-level security on `deals` (enabled, no policies) blocks reads and writes, so deals quietly fall back to memory.
5. Open `backend/.env` and paste:
   ```env
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_KEY=your-supabase-key
   ```
6. Restart the FastAPI server. You will see:
   ` Connected to Supabase at https://your-project.supabase.co`

---

## 3. Endpoints Implemented

| Endpoint | Method | Description |
|---|---|---|
| `/health` | `GET` | Service status and whether Supabase is configured |
| `/feed?side=` | `GET` | Returns the seeded counterpart cards for buyer or supplier |
| `/requests` | `POST` | Kitchen lead posts weekly supply request |
| `/negotiations` | `POST` | Right-swipe trigger: logs the swipe and runs the negotiation engine; `fresh-poultry` returns `noDeal` |
| `/cards/skip` | `POST` | Left-swipe: logs the skipped card |
| `/negotiations/:id?viewer=` | `GET` | **Confidential View**: Viewer's own limit only; band estimated from public numbers |
| `/limits/own?side=` | `GET` | Returns caller's own sealed limit |
| `/deals/:id` | `GET` | Returns deal record, pinned terms, and current approvals |
| `/deals/:id/approve` | `POST` | Enforces staff limits (RM500/RM300) and marks deal sealed on dual owner approvals |
| `/deals/:id/reject` | `POST` | Records rejection reason |
| `/deals/:id/ask-owner` | `POST` | Triggers owner notification when total exceeds staff limit |
| `/deals/:id/undo-ask-owner` | `POST` | Cancels the staff request to the owner; asking again is logged as a new request |
| `/deals/:id/counter` | `POST` | Logs the owner's counter note (resuming the negotiation is not built yet) |
| `/deals/:id/invoice` | `GET` | Compares synthetic invoice INV-8841 line by line with the pinned terms (the frontend currently does this itself) |
| `/history/:counterpartId` | `GET` | Synthetic week-3 history and memory (not used by the frontend yet) |
| `/log?side=&role=` | `GET` | Append-only audit log (filters `staff_visible` for staff) |
| `/log` | `POST` | Records immutable audit event |
| `/wakil/:side` | `GET/PUT` | Gets or saves the Wakil look, language, tone and notes (notes are stored, not yet used by the engine) |
| `/demo/reset` | `POST` | Resets demo session state |

---

## 4. Key Security Invariant

- **The Sealed Limit Boundary**: Under no circumstance does `GET /negotiations/:id` expose the counterpart's private ceiling or floor. The server guarantees that only the `viewer`'s own limit is returned in `ownLimitPerKg`. The opposite boundary in `band` is computed server-side from public benchmark metrics.
- There is no auth yet: `viewer` and `side` come from the request, so the boundary holds in the app's UI but not against a caller who asks for the other side. The `sealed_limits` read policy in `schema.sql` is `USING (true)`; the backend, not RLS, keeps each side to its own limit.
