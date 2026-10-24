# SupplySwipe (Wakil) - Python FastAPI + Supabase Backend

Autonomous negotiation & procurement backend for SME F&B businesses (SDC Hackathon 2026).

---

## 1. Quick Start

### 1.1 Activate Environment & Run Server
From the root or `backend/` directory:

```bash
# On Windows PowerShell:
.\backend\.venv\Scripts\Activate.ps1
cd backend
uvicorn main:app --reload --port 8000
```

Or using python directly:
```bash
.\backend\.venv\Scripts\python.exe backend\main.py
```

The API will be live at:
- **API Base**: `http://localhost:8000`
- **Swagger Documentation**: `http://localhost:8000/docs`
- **Interactive Redoc**: `http://localhost:8000/redoc`
- **Health Check**: `http://localhost:8000/health`

---

## 2. Supabase Setup (Database)

1. Open your project on [Supabase Dashboard](https://supabase.com).
2. Go to **SQL Editor** -> **New Query**.
3. Copy the entire contents of [`backend/schema.sql`](./schema.sql) and press **Run**.
   - This creates all tables (`businesses`, `wakil_profiles`, `sealed_limits`, `counterparts`, `negotiations`, `deals`, `activity_logs`, etc.).
   - It also pre-seeds the demo dataset (`Restoran Mak Ngah`, `Ayam Segar Enterprise`, feed cards, negotiation rounds, and initial logs).
4. Go to **Project Settings** -> **API**:
   - Copy **Project URL**
   - Copy **anon public** or **service_role** key
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
| `/feed?side=` | `GET` | Returns counterpart cards for buyer or supplier |
| `/requests` | `POST` | Kitchen lead posts weekly supply request |
| `/negotiations` | `POST` | Right-swipe trigger to start autonomous Wakil negotiation |
| `/negotiations/:id?viewer=` | `GET` | **Confidential View**: Viewer's own limit only; band estimated from public numbers |
| `/limits/own?side=` | `GET` | Returns caller's own sealed limit |
| `/deals/:id` | `GET` | Returns deal record, pinned terms, and current approvals |
| `/deals/:id/approve` | `POST` | Enforces staff limits (RM500/RM300) and marks deal sealed on dual owner approvals |
| `/deals/:id/reject` | `POST` | Records rejection reason |
| `/deals/:id/ask-owner` | `POST` | Triggers owner notification when total exceeds staff limit |
| `/deals/:id/counter` | `POST` | Sends owner note to Wakil for up to 4 more rounds |
| `/log?side=&role=` | `GET` | Append-only audit log (filters `staff_visible` for staff) |
| `/log` | `POST` | Records immutable audit event |
| `/wakil/:side` | `GET/PUT` | Customizes Wakil avatar (look, hat, color) and prompt notes |
| `/demo/reset` | `POST` | Resets demo session state |

---

## 4. Key Security Invariant

- **The Sealed Limit Boundary**: Under no circumstance does `GET /negotiations/:id` expose the counterpart's private ceiling or floor. The server guarantees that only the `viewer`'s own limit is returned in `ownLimitPerKg`. The opposite boundary in `band` is computed server-side from public benchmark metrics.
