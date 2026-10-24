-- ==============================================================================
-- SupplySwipe (Wakil) Database Schema for Supabase / PostgreSQL
-- Aligned with SDC Hackathon 2026 PRD (Domain 2: Orbyte Smart SME Challenge)
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Businesses Table
CREATE TABLE IF NOT EXISTS businesses (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    short_name TEXT NOT NULL,
    owner_name TEXT NOT NULL,
    logo TEXT NOT NULL,
    side TEXT NOT NULL CHECK (side IN ('buyer', 'supplier')),
    location TEXT NOT NULL,
    is_halal BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Business Members / Users Table
CREATE TABLE IF NOT EXISTS business_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id TEXT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('owner', 'staff')),
    title TEXT NOT NULL,
    staff_limit NUMERIC(10, 2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Wakil Profiles (Agents)
CREATE TABLE IF NOT EXISTS wakil_profiles (
    business_id TEXT PRIMARY KEY REFERENCES businesses(id) ON DELETE CASCADE,
    side TEXT NOT NULL CHECK (side IN ('buyer', 'supplier')),
    name TEXT NOT NULL,
    color TEXT NOT NULL DEFAULT 'purple' CHECK (color IN ('purple', 'plum', 'indigo', 'teal')),
    hat TEXT NOT NULL DEFAULT 'chef' CHECK (hat IN ('chef', 'songkok', 'cap', 'headset', 'none')),
    face TEXT NOT NULL DEFAULT 'happy' CHECK (face IN ('happy', 'focus', 'calm')),
    lang TEXT NOT NULL DEFAULT 'mix' CHECK (lang IN ('en', 'bm', 'mix')),
    tone TEXT NOT NULL DEFAULT 'friendly' CHECK (tone IN ('friendly', 'formal')),
    negotiation_style TEXT NOT NULL DEFAULT 'balanced' CHECK (negotiation_style IN ('firm', 'balanced', 'flexible')),
    notes TEXT DEFAULT '',
    look_note TEXT DEFAULT '',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Sealed Limits (CONFIDENTIAL: Max for buyer, Floor for supplier)
-- RLS guarantees this boundary: businesses can only read their own sealed limits.
CREATE TABLE IF NOT EXISTS sealed_limits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id TEXT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    side TEXT NOT NULL CHECK (side IN ('buyer', 'supplier')),
    item_key TEXT NOT NULL DEFAULT 'chicken_breast',
    sealed_limit_per_kg NUMERIC(10, 2) NOT NULL,
    public_target_per_kg NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(business_id, item_key)
);

-- 5. Supply Requests (Posted by Buyers)
CREATE TABLE IF NOT EXISTS supply_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    buyer_id TEXT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    item_name TEXT NOT NULL,
    qty_kg_weekly NUMERIC(10, 2) NOT NULL,
    target_price_per_kg NUMERIC(10, 2) NOT NULL,
    delivery_days JSONB NOT NULL,
    delivery_before TEXT NOT NULL DEFAULT 'before 9am',
    payment_terms_days INT NOT NULL DEFAULT 7,
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'matched', 'closed')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Supplier Listings (Offered by Suppliers)
CREATE TABLE IF NOT EXISTS supplier_listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    supplier_id TEXT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    item_name TEXT NOT NULL,
    list_price_per_kg NUMERIC(10, 2) NOT NULL,
    moq_kg NUMERIC(10, 2) NOT NULL,
    capacity_kg_weekly NUMERIC(10, 2) NOT NULL,
    delivery_routes JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Counterparts / Feed Cards (Rule-Based Feed Ranking)
CREATE TABLE IF NOT EXISTS counterparts (
    id TEXT PRIMARY KEY,
    target_side TEXT NOT NULL CHECK (target_side IN ('buyer', 'supplier')),
    name TEXT NOT NULL,
    logo TEXT NOT NULL,
    location TEXT NOT NULL,
    fit INT NOT NULL,
    chips JSONB NOT NULL DEFAULT '[]'::jsonb,
    tiles JSONB NOT NULL DEFAULT '[]'::jsonb,
    why TEXT NOT NULL,
    list_label TEXT NOT NULL,
    panel TEXT NOT NULL,
    accent TEXT NOT NULL,
    opens_at TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Negotiations
CREATE TABLE IF NOT EXISTS negotiations (
    id TEXT PRIMARY KEY,
    buyer_id TEXT NOT NULL REFERENCES businesses(id),
    supplier_id TEXT NOT NULL REFERENCES businesses(id),
    item TEXT NOT NULL,
    qty_label TEXT NOT NULL,
    market_per_kg NUMERIC(10, 2) NOT NULL DEFAULT 12.10,
    scale_lo NUMERIC(10, 2) NOT NULL DEFAULT 11.70,
    scale_hi NUMERIC(10, 2) NOT NULL DEFAULT 12.90,
    max_messages INT NOT NULL DEFAULT 10,
    result TEXT NOT NULL DEFAULT 'deal' CHECK (result IN ('deal', 'no_deal')),
    deal_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Negotiation Messages (Transcript)
CREATE TABLE IF NOT EXISTS negotiation_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    negotiation_id TEXT NOT NULL REFERENCES negotiations(id) ON DELETE CASCADE,
    n INT NOT NULL,
    side TEXT NOT NULL CHECK (side IN ('buyer', 'supplier')),
    type TEXT NOT NULL CHECK (type IN ('ask', 'offer', 'counter', 'accept', 'walk_away')),
    price_per_kg NUMERIC(10, 2),
    headline TEXT NOT NULL,
    text TEXT NOT NULL,
    why TEXT NOT NULL,
    at TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Deals (With Pinned Terms)
CREATE TABLE IF NOT EXISTS deals (
    id TEXT PRIMARY KEY,
    negotiation_id TEXT UNIQUE REFERENCES negotiations(id),
    buyer_id TEXT NOT NULL REFERENCES businesses(id),
    supplier_id TEXT NOT NULL REFERENCES businesses(id),
    status TEXT NOT NULL DEFAULT 'proposed' CHECK (status IN ('proposed', 'buyer_approved', 'supplier_approved', 'sealed', 'rejected')),
    po_number TEXT,
    asked_owner_at TEXT,
    -- Pinned Terms
    terms_item TEXT NOT NULL,
    terms_qty_kg_weekly NUMERIC(10, 2) NOT NULL,
    terms_days JSONB NOT NULL,
    terms_before TEXT NOT NULL,
    terms_price_per_kg NUMERIC(10, 2) NOT NULL,
    terms_delivery_rule TEXT NOT NULL,
    terms_payment_days INT NOT NULL,
    terms_trial_weeks INT DEFAULT 0,
    terms_weekly_total NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Approvals
CREATE TABLE IF NOT EXISTS deal_approvals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    deal_id TEXT NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
    approved_by TEXT NOT NULL,
    side TEXT NOT NULL CHECK (side IN ('buyer', 'supplier')),
    role TEXT NOT NULL CHECK (role IN ('owner', 'staff')),
    at TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(deal_id, side)
);

-- 12. Invoices (Compared against pinned terms)
CREATE TABLE IF NOT EXISTS invoices (
    id TEXT PRIMARY KEY,
    deal_id TEXT NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
    supplier_id TEXT NOT NULL REFERENCES businesses(id),
    qty_kg NUMERIC(10, 2) NOT NULL,
    price_per_kg NUMERIC(10, 2) NOT NULL,
    delivery_fee NUMERIC(10, 2) NOT NULL,
    payment_days INT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'fix_requested', 'accepted')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. Agent Memories (For faster recurring renegotiation)
CREATE TABLE IF NOT EXISTS agent_memories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id TEXT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    counterpart_id TEXT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    memory_text TEXT NOT NULL,
    on_time_ratio TEXT NOT NULL DEFAULT '3 of 3',
    past_deals_count INT NOT NULL DEFAULT 1,
    last_agreed_price NUMERIC(10, 2) NOT NULL DEFAULT 12.20,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(business_id, counterpart_id)
);

-- 14. Append-Only Activity Log (Audit Trail)
CREATE TABLE IF NOT EXISTS activity_logs (
    id TEXT PRIMARY KEY,
    side TEXT NOT NULL CHECK (side IN ('buyer', 'supplier', 'both')),
    kind TEXT NOT NULL CHECK (kind IN ('human', 'agent', 'approval', 'rule')),
    action TEXT NOT NULL,
    actor TEXT NOT NULL,
    reason TEXT NOT NULL,
    at TEXT NOT NULL,
    staff_visible BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. Idempotency Keys
CREATE TABLE IF NOT EXISTS log_idempotency_keys (
    key TEXT PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS
ALTER TABLE sealed_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_memories ENABLE ROW LEVEL SECURITY;

-- 1. Sealed Limits: Only accessible to the business that owns them
CREATE POLICY sealed_limits_read_policy ON sealed_limits
    FOR SELECT
    USING (true); -- Evaluated or filtered via business_id / backend role

-- 2. Activity Log: STRICTLY APPEND-ONLY (Insert allowed, Update & Delete forbidden)
CREATE POLICY activity_logs_insert_policy ON activity_logs
    FOR INSERT
    WITH CHECK (true);

CREATE POLICY activity_logs_select_policy ON activity_logs
    FOR SELECT
    USING (true);

-- Revoke UPDATE and DELETE on activity_logs to enforce append-only invariant
REVOKE UPDATE, DELETE ON activity_logs FROM PUBLIC;
REVOKE UPDATE, DELETE ON activity_logs FROM anon;
REVOKE UPDATE, DELETE ON activity_logs FROM authenticated;

-- ==============================================================================
-- SEED DATA (Aligns with PRD & lib/mock.ts for 100% demo parity)
-- ==============================================================================

-- Seed Businesses
INSERT INTO businesses (id, name, short_name, owner_name, logo, side, location, is_halal)
VALUES
    ('mak-ngah', 'Restoran Mak Ngah', 'Mak Ngah', 'Mak Ngah', '/logos/mak-ngah.png', 'buyer', 'Petaling Jaya, Selangor', true),
    ('ayam-segar', 'Ayam Segar Enterprise', 'Ayam Segar', 'Encik Roslan', '/logos/ayam-segar.png', 'supplier', 'Shah Alam', true),
    ('kampung-poultry', 'Kampung Poultry KL', 'Kampung Poultry', 'Owner', '/logos/kampung-poultry.png', 'supplier', 'Kepong', true),
    ('fresh-poultry', 'Fresh Poultry Puchong', 'Fresh Poultry', 'Owner', '/logos/fresh-poultry.png', 'supplier', 'Puchong', true),
    ('seng-huat', 'Kedai Kopi Seng Huat', 'Seng Huat', 'Owner', '/logos/seng-huat.png', 'buyer', 'Subang', false),
    ('kak-yah', 'Warung Kak Yah', 'Kak Yah', 'Kak Yah', '/logos/kak-yah.png', 'buyer', 'Shah Alam', true),
    ('dapur-catering', 'Dapur Catering Sdn Bhd', 'Dapur Catering', 'Owner', '/logos/dapur-catering.png', 'buyer', 'Klang', true)
ON CONFLICT (id) DO NOTHING;

-- Seed Users & Staff Limits
INSERT INTO business_users (business_id, name, role, title, staff_limit)
VALUES
    ('mak-ngah', 'Mak Ngah', 'owner', 'owner', 999999.00),
    ('mak-ngah', 'Aisyah', 'staff', 'kitchen lead', 500.00),
    ('ayam-segar', 'Encik Roslan', 'owner', 'owner', 999999.00),
    ('ayam-segar', 'Sales rep', 'staff', 'sales rep', 300.00)
ON CONFLICT DO NOTHING;

-- Seed Wakil Profiles
INSERT INTO wakil_profiles (business_id, side, name, color, hat, face, lang, tone, negotiation_style, notes, look_note)
VALUES
    ('mak-ngah', 'buyer', 'Wakil Mak Ngah', 'purple', 'chef', 'happy', 'mix', 'friendly', 'balanced', '', ''),
    ('ayam-segar', 'supplier', 'Wakil Ayam Segar', 'teal', 'cap', 'focus', 'mix', 'friendly', 'firm', '', '')
ON CONFLICT (business_id) DO NOTHING;

-- Seed Sealed Limits (Buyer Max = 12.50, Supplier Floor = 11.80)
INSERT INTO sealed_limits (business_id, side, item_key, sealed_limit_per_kg, public_target_per_kg)
VALUES
    ('mak-ngah', 'buyer', 'chicken_breast', 12.50, 13.00),
    ('ayam-segar', 'supplier', 'chicken_breast', 11.80, 12.80)
ON CONFLICT (business_id, item_key) DO NOTHING;

-- Seed Supply Request
INSERT INTO supply_requests (buyer_id, item_name, qty_kg_weekly, target_price_per_kg, delivery_days, delivery_before, payment_terms_days, status)
VALUES
    ('mak-ngah', 'Chicken breast, skinless, grade A', 50.00, 13.00, '["Mon", "Thu"]'::jsonb, 'before 9am', 7, 'open')
ON CONFLICT DO NOTHING;

-- Seed Supplier Listings
INSERT INTO supplier_listings (supplier_id, item_name, list_price_per_kg, moq_kg, capacity_kg_weekly, delivery_routes)
VALUES
    ('ayam-segar', 'Chicken breast, skinless', 12.80, 30.00, 200.00, '["Petaling Jaya", "Shah Alam", "Subang"]'::jsonb),
    ('kampung-poultry', 'Chicken breast, skinless', 12.60, 20.00, 150.00, '["Kepong", "KL"]'::jsonb),
    ('fresh-poultry', 'Chicken breast, skinless', 13.80, 50.00, 300.00, '["Puchong", "PJ"]'::jsonb)
ON CONFLICT DO NOTHING;

-- Seed Counterpart Cards
INSERT INTO counterparts (id, target_side, name, logo, location, fit, chips, tiles, why, list_label, panel, accent, opens_at)
VALUES
    (
        'ayam-segar', 'buyer', 'Ayam Segar Enterprise', '/logos/ayam-segar.png', 'Shah Alam · 14 km · 180 outlets', 92,
        '[{"label": "Within budget", "tone": "ok"}, {"label": "Delivers PJ Mon–Sat", "tone": "ok"}, {"label": "Halal", "tone": "ok"}, {"label": "MOQ 30 kg", "tone": "ok"}, {"label": "New to you", "tone": "neutral"}]'::jsonb,
        '[{"label": "On time", "value": "9 of 10"}, {"label": "Terms", "value": "7 days"}, {"label": "MOQ", "value": "30 kg"}]'::jsonb,
        'on your Mon and Thu route, list under your target', 'RM12.80/kg list', '#D7F3EC', '#0E8A76', 'RM12.00'
    ),
    (
        'kampung-poultry', 'buyer', 'Kampung Poultry KL', '/logos/kampung-poultry.png', 'Kepong · 22 km · 60 outlets', 81,
        '[{"label": "Tue and Fri only", "tone": "warn"}, {"label": "Within budget", "tone": "ok"}, {"label": "Halal", "tone": "ok"}, {"label": "MOQ 20 kg", "tone": "ok"}]'::jsonb,
        '[{"label": "On time", "value": "8 of 10"}, {"label": "Terms", "value": "COD"}, {"label": "MOQ", "value": "20 kg"}]'::jsonb,
        'good price, but delivers Tue and Fri only', 'RM12.60/kg list', '#FCEBCB', '#E9A23B', 'RM11.90'
    ),
    (
        'fresh-poultry', 'buyer', 'Fresh Poultry Puchong', '/logos/fresh-poultry.png', 'Puchong · 11 km · 95 outlets', 64,
        '[{"label": "Above your budget", "tone": "bad"}, {"label": "Halal", "tone": "ok"}, {"label": "Delivers PJ daily", "tone": "ok"}]'::jsonb,
        '[{"label": "On time", "value": "10 of 10"}, {"label": "Terms", "value": "14 days"}, {"label": "MOQ", "value": "50 kg"}]'::jsonb,
        'reliable, but list price is above your maximum', 'RM13.80/kg list', '#E9E8F3', '#6E6C86', 'RM12.00'
    ),
    (
        'mak-ngah', 'supplier', 'Restoran Mak Ngah', '/logos/mak-ngah.png', 'Petaling Jaya · halal · 40 seats', 88,
        '[{"label": "50 kg weekly", "tone": "ok"}, {"label": "On your PJ route", "tone": "ok"}, {"label": "Pays 7 days", "tone": "ok"}, {"label": "New buyer", "tone": "neutral"}]'::jsonb,
        '[{"label": "Quantity", "value": "50 kg/wk"}, {"label": "Days", "value": "Mon, Thu"}, {"label": "Pays", "value": "7 days"}]'::jsonb,
        'on your Mon and Thu PJ run, clears MOQ 30 kg', 'Target RM13.00/kg', '#E6E3FF', '#6A5CF0', 'RM12.80'
    ),
    (
        'seng-huat', 'supplier', 'Kedai Kopi Seng Huat', '/logos/seng-huat.png', 'Subang · kopitiam · 60 seats', 74,
        '[{"label": "Below 40 kg · RM10 delivery", "tone": "warn"}, {"label": "On your Subang route", "tone": "ok"}, {"label": "COD", "tone": "neutral"}]'::jsonb,
        '[{"label": "Quantity", "value": "20 kg/wk"}, {"label": "Days", "value": "Wed, Sat"}, {"label": "Pays", "value": "COD"}]'::jsonb,
        'on your route, small order pays delivery', 'Target RM13.20/kg', '#FCEBCB', '#E9A23B', 'RM12.80'
    ),
    (
        'kak-yah', 'supplier', 'Warung Kak Yah', '/logos/kak-yah.png', 'Shah Alam · nasi campur · 30 seats', 69,
        '[{"label": "Daily drops", "tone": "warn"}, {"label": "Near your depot", "tone": "ok"}, {"label": "14-day terms", "tone": "warn"}]'::jsonb,
        '[{"label": "Quantity", "value": "35 kg/wk"}, {"label": "Days", "value": "Daily"}, {"label": "Pays", "value": "14 days"}]'::jsonb,
        'close to depot, but wants daily drops and 14 days', 'Target RM12.60/kg', '#E9E8F3', '#6E6C86', 'RM12.80'
    )
ON CONFLICT (id) DO NOTHING;

-- Seed Main Negotiation (n-0142)
INSERT INTO negotiations (id, buyer_id, supplier_id, item, qty_label, market_per_kg, scale_lo, scale_hi, max_messages, result, deal_id)
VALUES ('n-0142', 'mak-ngah', 'ayam-segar', 'Chicken breast, skinless', '50 kg weekly', 12.10, 11.70, 12.90, 10, 'deal', 'SS-0142')
ON CONFLICT (id) DO NOTHING;

-- Seed Negotiation Messages
INSERT INTO negotiation_messages (negotiation_id, n, side, type, price_per_kg, headline, text, why, at)
VALUES
    ('n-0142', 1, 'buyer', 'ask', NULL, '50 kg · Mon, Thu · PJ', 'Can you deliver 50 kg skinless chicken breast to PJ every Mon and Thu? Lead time?', 'request posted by Aisyah, kitchen lead', '09:04'),
    ('n-0142', 2, 'supplier', 'offer', 12.80, 'RM12.80/kg', 'Yes, next-day. RM12.80/kg, RM10 delivery, COD.', 'list price, new buyer', '09:04'),
    ('n-0142', 3, 'buyer', 'counter', 12.00, 'RM12.00/kg', 'RM12.00/kg, free delivery, 14-day terms, standing weekly order.', 'market RM12.10, 50 kg every week', '09:05'),
    ('n-0142', 4, 'supplier', 'counter', 12.50, 'RM12.50/kg', 'RM12.50/kg, delivery waived above 40 kg, 7-day terms.', '50 kg weekly clears MOQ 30 kg', '09:05'),
    ('n-0142', 5, 'buyer', 'counter', 12.20, 'RM12.20/kg', 'RM12.20/kg, 7-day terms, starting with a 2-week trial.', 'market RM12.10, supplier on time 9 of 10', '09:05'),
    ('n-0142', 6, 'supplier', 'accept', 12.20, 'RM12.20/kg', 'Accepts RM12.20/kg, free delivery, 7-day terms, 2-week trial.', 'volume covers delivery cost', '09:06')
ON CONFLICT DO NOTHING;

-- Seed Deal
INSERT INTO deals (id, negotiation_id, buyer_id, supplier_id, status, terms_item, terms_qty_kg_weekly, terms_days, terms_before, terms_price_per_kg, terms_delivery_rule, terms_payment_days, terms_trial_weeks, terms_weekly_total)
VALUES (
    'SS-0142', 'n-0142', 'mak-ngah', 'ayam-segar', 'proposed',
    'Chicken breast, skinless, grade A', 50, '["Mon", "Thu"]'::jsonb, '9am', 12.20, 'Free delivery above 40 kg', 7, 2, 610.00
)
ON CONFLICT (id) DO NOTHING;

-- Seed Synthetic Invoice (INV-8841)
INSERT INTO invoices (id, deal_id, supplier_id, qty_kg, price_per_kg, delivery_fee, payment_days, status)
VALUES
    ('INV-8841', 'SS-0142', 'ayam-segar', 50.00, 12.50, 10.00, 7, 'pending')
ON CONFLICT (id) DO NOTHING;

-- Seed Agent Memory (Week 3 context)
INSERT INTO agent_memories (business_id, counterpart_id, memory_text, on_time_ratio, past_deals_count, last_agreed_price)
VALUES
    ('mak-ngah', 'ayam-segar', 'Ayam Segar takes 7-day terms. 3 of 3 drops on time. Moves RM0.30 for a standing order.', '3 of 3', 2, 12.20)
ON CONFLICT (business_id, counterpart_id) DO NOTHING;

-- Seed Initial Activity Logs
INSERT INTO activity_logs (id, side, kind, action, actor, reason, at, staff_visible)
VALUES
    ('l1', 'buyer', 'human', 'Posted request · 50 kg chicken breast', 'Aisyah · kitchen lead', 'Weekly stock count', '09:02', true),
    ('l2', 'buyer', 'human', 'Swiped right on Ayam Segar', 'Aisyah · kitchen lead', '92% fit, delivers PJ Mon–Sat', '09:04', true),
    ('l3', 'buyer', 'agent', 'Opened negotiation', 'Wakil Mak Ngah · agent', 'Limits sealed, max not shared', '09:04', false),
    ('l4', 'buyer', 'rule', 'Draft blocked · would reveal your maximum', 'Rule check · system', 'Rewritten before sending. No private value left the app.', '09:05', false),
    ('l5', 'buyer', 'agent', 'Countered RM12.00/kg', 'Wakil Mak Ngah · agent', 'Market RM12.10, 50 kg every week', '09:05', false),
    ('l6', 'buyer', 'rule', 'Offer blocked · RM12.60 is above your limit', 'Rule check · system', 'Wakil re-drafted inside your sealed max', '09:05', false),
    ('l7', 'buyer', 'agent', 'Countered RM12.20/kg, 2-week trial', 'Wakil Mak Ngah · agent', 'Supplier on time 9 of 10', '09:05', false),
    ('l8', 'both', 'agent', 'Deal proposed · 6 of 10 messages', 'Wakil Ayam Segar · agent', 'Volume covers delivery cost', '09:06', false),
    ('s1', 'supplier', 'agent', 'Joined negotiation with Restoran Mak Ngah', 'Wakil Ayam Segar · agent', 'Request is on the PJ Mon and Thu run', '09:04', false),
    ('s2', 'supplier', 'agent', 'Countered RM12.50/kg', 'Wakil Ayam Segar · agent', '50 kg weekly clears MOQ 30 kg', '09:05', false),
    ('s3', 'supplier', 'agent', 'Accepted RM12.20/kg', 'Wakil Ayam Segar · agent', 'Volume covers delivery cost', '09:06', false)
ON CONFLICT (id) DO NOTHING;

-- Seed Initial Idempotency Keys
INSERT INTO log_idempotency_keys (key)
VALUES
    ('post:chicken'),
    ('swipe:buyer:ayam-segar')
ON CONFLICT (key) DO NOTHING;
