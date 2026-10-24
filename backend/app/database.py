import time
import random
from typing import Dict, List, Optional, Any
from app.config import settings
from app.schemas import (
    Side, Role, Counterpart, Deal, Approval, LogRow, NegotiationView, WakilProfile, NegMessage, Terms
)

# Optional Supabase client
supabase_client = None
if settings.has_supabase:
    try:
        from supabase import create_client, Client
        supabase_client: Optional[Client] = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
        print(" Connected to Supabase at", settings.SUPABASE_URL)
    except Exception as e:
        print(" Failed to initialize Supabase client:", e)
        supabase_client = None

# ==============================================================================
# Seed Data Models & In-Memory Store
# ==============================================================================

BUYER_CARDS: List[Dict[str, Any]] = [
    {
        "id": "mak-ngah",
        "name": "Restoran Mak Ngah",
        "logo": "/logos/mak-ngah.png",
        "location": "Petaling Jaya · halal · 40 seats",
        "fit": 88,
        "listLabel": "Target RM13.00/kg",
        "opensAt": "RM12.80",
        "panel": "#E6E3FF",
        "accent": "#6A5CF0",
        "tiles": [
            {"label": "Quantity", "value": "50 kg/wk"},
            {"label": "Days", "value": "Mon, Thu"},
            {"label": "Pays", "value": "7 days"},
        ],
        "chips": [
            {"label": "50 kg weekly", "tone": "ok"},
            {"label": "On your PJ route", "tone": "ok"},
            {"label": "Pays 7 days", "tone": "ok"},
            {"label": "New buyer", "tone": "neutral"},
        ],
        "why": "on your Mon and Thu PJ run, clears MOQ 30 kg",
    },
    {
        "id": "seng-huat",
        "name": "Kedai Kopi Seng Huat",
        "logo": "/logos/seng-huat.png",
        "location": "Subang · kopitiam · 60 seats",
        "fit": 74,
        "listLabel": "Target RM13.20/kg",
        "opensAt": "RM12.80",
        "panel": "#FCEBCB",
        "accent": "#E9A23B",
        "tiles": [
            {"label": "Quantity", "value": "20 kg/wk"},
            {"label": "Days", "value": "Wed, Sat"},
            {"label": "Pays", "value": "COD"},
        ],
        "chips": [
            {"label": "Below 40 kg · RM10 delivery", "tone": "warn"},
            {"label": "On your Subang route", "tone": "ok"},
            {"label": "COD", "tone": "neutral"},
        ],
        "why": "on your route, small order pays delivery",
    },
    {
        "id": "kak-yah",
        "name": "Warung Kak Yah",
        "logo": "/logos/kak-yah.png",
        "location": "Shah Alam · nasi campur · 30 seats",
        "fit": 69,
        "listLabel": "Target RM12.60/kg",
        "opensAt": "RM12.80",
        "panel": "#E9E8F3",
        "accent": "#6E6C86",
        "tiles": [
            {"label": "Quantity", "value": "35 kg/wk"},
            {"label": "Days", "value": "Daily"},
            {"label": "Pays", "value": "14 days"},
        ],
        "chips": [
            {"label": "Daily drops", "tone": "warn"},
            {"label": "Near your depot", "tone": "ok"},
            {"label": "14-day terms", "tone": "warn"},
        ],
        "why": "close to depot, but wants daily drops and 14 days",
    },
]

SUPPLIER_CARDS: List[Dict[str, Any]] = [
    {
        "id": "ayam-segar",
        "name": "Ayam Segar Enterprise",
        "logo": "/logos/ayam-segar.png",
        "location": "Shah Alam · 14 km · 180 outlets",
        "fit": 92,
        "listLabel": "RM12.80/kg list",
        "opensAt": "RM12.00",
        "panel": "#D7F3EC",
        "accent": "#0E8A76",
        "tiles": [
            {"label": "On time", "value": "9 of 10"},
            {"label": "Terms", "value": "7 days"},
            {"label": "MOQ", "value": "30 kg"},
        ],
        "chips": [
            {"label": "Within budget", "tone": "ok"},
            {"label": "Delivers PJ Mon–Sat", "tone": "ok"},
            {"label": "Halal", "tone": "ok"},
            {"label": "MOQ 30 kg", "tone": "ok"},
            {"label": "New to you", "tone": "neutral"},
        ],
        "why": "on your Mon and Thu route, list under your target",
    },
    {
        "id": "kampung-poultry",
        "name": "Kampung Poultry KL",
        "logo": "/logos/kampung-poultry.png",
        "location": "Kepong · 22 km · 60 outlets",
        "fit": 81,
        "listLabel": "RM12.60/kg list",
        "opensAt": "RM11.90",
        "panel": "#FCEBCB",
        "accent": "#E9A23B",
        "tiles": [
            {"label": "On time", "value": "8 of 10"},
            {"label": "Terms", "value": "COD"},
            {"label": "MOQ", "value": "20 kg"},
        ],
        "chips": [
            {"label": "Tue and Fri only", "tone": "warn"},
            {"label": "Within budget", "tone": "ok"},
            {"label": "Halal", "tone": "ok"},
            {"label": "MOQ 20 kg", "tone": "ok"},
        ],
        "why": "good price, but delivers Tue and Fri only",
    },
    {
        "id": "fresh-poultry",
        "name": "Fresh Poultry Puchong",
        "logo": "/logos/fresh-poultry.png",
        "location": "Puchong · 11 km · 95 outlets",
        "fit": 64,
        "listLabel": "RM13.80/kg list",
        "opensAt": "RM12.00",
        "panel": "#E9E8F3",
        "accent": "#6E6C86",
        "tiles": [
            {"label": "On time", "value": "10 of 10"},
            {"label": "Terms", "value": "14 days"},
            {"label": "MOQ", "value": "50 kg"},
        ],
        "chips": [
            {"label": "Above your budget", "tone": "bad"},
            {"label": "Halal", "tone": "ok"},
            {"label": "Delivers PJ daily", "tone": "ok"},
        ],
        "why": "reliable, but list price is above your maximum",
    },
]

SEALED_LIMITS = {
    "buyer": 12.50,    # Mak Ngah's maximum (RM/kg)
    "supplier": 11.80, # Ayam Segar's floor (RM/kg)
}

STAFF_LIMITS = {
    "buyer": 500.0,    # Aisyah limit
    "supplier": 300.0, # Sales rep limit
}

PUBLIC_NUMBERS = {
    "buyerTargetPerKg": 13.0,
    "supplierListPerKg": 12.8,
    "marketPerKg": 12.10,
    "moqKg": 30,
}

DEFAULT_TRANSCRIPT: List[Dict[str, Any]] = [
    {"n": 1, "side": "buyer", "type": "ask", "headline": "50 kg · Mon, Thu · PJ", "text": "Can you deliver 50 kg skinless chicken breast to PJ every Mon and Thu? Lead time?", "why": "request posted by Aisyah, kitchen lead", "at": "09:04"},
    {"n": 2, "side": "supplier", "type": "offer", "pricePerKg": 12.80, "headline": "RM12.80/kg", "text": "Yes, next-day. RM12.80/kg, RM10 delivery, COD.", "why": "list price, new buyer", "at": "09:04"},
    {"n": 3, "side": "buyer", "type": "counter", "pricePerKg": 12.00, "headline": "RM12.00/kg", "text": "RM12.00/kg, free delivery, 14-day terms, standing weekly order.", "why": "market RM12.10, 50 kg every week", "at": "09:05"},
    {"n": 4, "side": "supplier", "type": "counter", "pricePerKg": 12.50, "headline": "RM12.50/kg", "text": "RM12.50/kg, delivery waived above 40 kg, 7-day terms.", "why": "50 kg weekly clears MOQ 30 kg", "at": "09:05"},
    {"n": 5, "side": "buyer", "type": "counter", "pricePerKg": 12.20, "headline": "RM12.20/kg", "text": "RM12.20/kg, 7-day terms, starting with a 2-week trial.", "why": "market RM12.10, supplier on time 9 of 10", "at": "09:05"},
    {"n": 6, "side": "supplier", "type": "accept", "pricePerKg": 12.20, "headline": "RM12.20/kg", "text": "Accepts RM12.20/kg, free delivery, 7-day terms, 2-week trial.", "why": "volume covers delivery cost", "at": "09:06"},
]

DEFAULT_TERMS = {
    "item": "Chicken breast, skinless, grade A",
    "qtyKgWeekly": 50,
    "days": ["Mon", "Thu"],
    "before": "9am",
    "pricePerKg": 12.20,
    "deliveryRule": "Free delivery above 40 kg",
    "paymentDays": 7,
    "trialWeeks": 2,
    "weeklyTotal": 610.0,
}

DEFAULT_LOGS: List[Dict[str, Any]] = [
    {"id": "l1", "side": "buyer", "kind": "human", "staffVisible": True, "action": "Posted request · 50 kg chicken breast", "actor": "Aisyah · kitchen lead", "reason": "Weekly stock count", "at": "09:02"},
    {"id": "l2", "side": "buyer", "kind": "human", "staffVisible": True, "action": "Swiped right on Ayam Segar", "actor": "Aisyah · kitchen lead", "reason": "92% fit, delivers PJ Mon–Sat", "at": "09:04"},
    {"id": "l3", "side": "buyer", "kind": "agent", "staffVisible": False, "action": "Opened negotiation", "actor": "Wakil Mak Ngah · agent", "reason": "Limits sealed, max not shared", "at": "09:04"},
    {"id": "l4", "side": "buyer", "kind": "rule", "staffVisible": False, "action": "Draft blocked · would reveal your maximum", "actor": "Rule check · system", "reason": "Rewritten before sending. No private value left the app.", "at": "09:05"},
    {"id": "l5", "side": "buyer", "kind": "agent", "staffVisible": False, "action": "Countered RM12.00/kg", "actor": "Wakil Mak Ngah · agent", "reason": "Market RM12.10, 50 kg every week", "at": "09:05"},
    {"id": "l6", "side": "buyer", "kind": "rule", "staffVisible": False, "action": "Offer blocked · RM12.60 is above your limit", "actor": "Rule check · system", "reason": "Wakil re-drafted inside your sealed max", "at": "09:05"},
    {"id": "l7", "side": "buyer", "kind": "agent", "staffVisible": False, "action": "Countered RM12.20/kg, 2-week trial", "actor": "Wakil Mak Ngah · agent", "reason": "Supplier on time 9 of 10", "at": "09:05"},
    {"id": "l8", "side": "both", "kind": "agent", "staffVisible": False, "action": "Deal proposed · 6 of 10 messages", "actor": "Wakil Ayam Segar · agent", "reason": "Volume covers delivery cost", "at": "09:06"},
    {"id": "s1", "side": "supplier", "kind": "agent", "staffVisible": False, "action": "Joined negotiation with Restoran Mak Ngah", "actor": "Wakil Ayam Segar · agent", "reason": "Request is on the PJ Mon and Thu run", "at": "09:04"},
    {"id": "s2", "side": "supplier", "kind": "agent", "staffVisible": False, "action": "Countered RM12.50/kg", "actor": "Wakil Ayam Segar · agent", "reason": "50 kg weekly clears MOQ 30 kg", "at": "09:05"},
    {"id": "s3", "side": "supplier", "kind": "agent", "staffVisible": False, "action": "Accepted RM12.20/kg", "actor": "Wakil Ayam Segar · agent", "reason": "Volume covers delivery cost", "at": "09:06"},
]

class MemoryStore:
    def __init__(self):
        self.reset()

    def reset(self):
        self.deal = Deal(
            id="SS-0142",
            negotiationId="n-0142",
            buyerId="mak-ngah",
            supplierId="ayam-segar",
            status="proposed",
            terms=Terms(**DEFAULT_TERMS),
            approvals=[]
        )
        self.logs = [LogRow(**r) for r in DEFAULT_LOGS]
        self.log_keys = set(["post:chicken", "swipe:buyer:ayam-segar"])
        self.wakil = {
            "buyer": WakilProfile(name="Wakil Mak Ngah", color="purple", hat="chef", face="happy", lang="mix", tone="friendly", notes="", lookNote=""),
            "supplier": WakilProfile(name="Wakil Ayam Segar", color="teal", hat="cap", face="focus", lang="mix", tone="friendly", notes="", lookNote=""),
        }
        self.posted_request = False

store = MemoryStore()

# ==============================================================================
# Database Access Functions (with Supabase sync if configured)
# ==============================================================================

async def get_feed_cards(side: Side) -> List[Counterpart]:
    if supabase_client:
        try:
            # Query counterparts where target_side == side
            res = supabase_client.table("counterparts").select("*").eq("target_side", side).execute()
            if res.data:
                cards = []
                for row in res.data:
                    cards.append(Counterpart(
                        id=row["id"],
                        name=row["name"],
                        logo=row["logo"],
                        location=row["location"],
                        fit=row["fit"],
                        chips=row["chips"],
                        tiles=row["tiles"],
                        why=row["why"],
                        listLabel=row["list_label"],
                        panel=row["panel"],
                        accent=row["accent"],
                        opensAt=row["opens_at"]
                    ))
                return cards
        except Exception as e:
            print("Supabase get_feed_cards error, using local data:", e)
    
    raw = SUPPLIER_CARDS if side == "buyer" else BUYER_CARDS
    return [Counterpart(**c) for c in raw]

async def get_own_limit(side: Side) -> float:
    if supabase_client:
        try:
            biz_id = "mak-ngah" if side == "buyer" else "ayam-segar"
            res = supabase_client.table("sealed_limits").select("sealed_limit_per_kg").eq("business_id", biz_id).execute()
            if res.data:
                return float(res.data[0]["sealed_limit_per_kg"])
        except Exception as e:
            print("Supabase get_own_limit error:", e)
    return SEALED_LIMITS[side]

async def get_negotiation_view(nego_id: str, viewer: Side) -> NegotiationView:
    own = await get_own_limit(viewer)
    
    # Estimate the band's counterpart end from public data (NEVER reveals counterpart's limit!)
    if viewer == "buyer":
        band = {"lo": round(PUBLIC_NUMBERS["marketPerKg"] - 0.30, 2), "hi": own}
    else:
        band = {"lo": own, "hi": round(PUBLIC_NUMBERS["buyerTargetPerKg"] - 0.50, 2)}
    
    messages = [NegMessage(**m) for m in DEFAULT_TRANSCRIPT]
    
    if supabase_client:
        try:
            res = supabase_client.table("negotiation_messages").select("*").eq("negotiation_id", nego_id).order("n").execute()
            if res.data:
                messages = [
                    NegMessage(
                        n=m["n"],
                        side=m["side"],
                        type=m["type"],
                        pricePerKg=m.get("price_per_kg"),
                        headline=m["headline"],
                        text=m["text"],
                        why=m["why"],
                        at=m["at"]
                    )
                    for m in res.data
                ]
        except Exception as e:
            print("Supabase get_negotiation_view messages error:", e)
            
    return NegotiationView(
        id=nego_id,
        viewer=viewer,
        buyerId="mak-ngah",
        supplierId="ayam-segar",
        item="Chicken breast, skinless",
        qtyLabel="50 kg weekly",
        marketPerKg=PUBLIC_NUMBERS["marketPerKg"],
        ownLimitPerKg=own,
        band=band,
        scale={"lo": 11.70, "hi": 12.90},
        messages=messages,
        maxMessages=20,
        dealId="SS-0142",
        result="deal"
    )

async def get_deal(deal_id: str) -> Deal:
    if supabase_client:
        try:
            res = supabase_client.table("deals").select("*").eq("id", deal_id).execute()
            if res.data:
                row = res.data[0]
                # Fetch approvals
                appr_res = supabase_client.table("deal_approvals").select("*").eq("deal_id", deal_id).execute()
                approvals = [
                    Approval(by=a["approved_by"], side=a["side"], role=a["role"], at=a["at"])
                    for a in (appr_res.data or [])
                ]
                return Deal(
                    id=row["id"],
                    negotiationId=row["negotiation_id"],
                    buyerId=row["buyer_id"],
                    supplierId=row["supplier_id"],
                    status=row["status"],
                    poNumber=row.get("po_number"),
                    askedOwnerAt=row.get("asked_owner_at"),
                    terms=Terms(
                        item=row["terms_item"],
                        qtyKgWeekly=row["terms_qty_kg_weekly"],
                        days=row["terms_days"],
                        before=row["terms_before"],
                        pricePerKg=row["terms_price_per_kg"],
                        deliveryRule=row["terms_delivery_rule"],
                        paymentDays=row["terms_payment_days"],
                        trialWeeks=row.get("terms_trial_weeks"),
                        weeklyTotal=row["terms_weekly_total"]
                    ),
                    approvals=approvals
                )
        except Exception as e:
            print("Supabase get_deal error:", e)
    return store.deal

async def save_deal(deal: Deal) -> None:
    store.deal = deal
    if supabase_client:
        try:
            # Update deals table
            supabase_client.table("deals").update({
                "status": deal.status,
                "po_number": deal.poNumber,
                "asked_owner_at": deal.askedOwnerAt,
            }).eq("id", deal.id).execute()
            
            # Sync approvals
            for a in deal.approvals:
                supabase_client.table("deal_approvals").upsert({
                    "deal_id": deal.id,
                    "approved_by": a.by,
                    "side": a.side,
                    "role": a.role,
                    "at": a.at
                }, on_conflict="deal_id,side").execute()
        except Exception as e:
            print("Supabase save_deal error:", e)

async def append_log(row: LogRow, key: Optional[str] = None) -> None:
    if key and key in store.log_keys:
        return
    if key:
        store.log_keys.add(key)
    store.logs.append(row)
    
    if supabase_client:
        try:
            supabase_client.table("activity_logs").insert({
                "id": row.id,
                "side": row.side,
                "kind": row.kind,
                "action": row.action,
                "actor": row.actor,
                "reason": row.reason,
                "at": row.at,
                "staff_visible": row.staffVisible
            }).execute()
        except Exception as e:
            print("Supabase append_log error:", e)

async def get_logs(side: Side, role: Role) -> List[LogRow]:
    if supabase_client:
        try:
            query = supabase_client.table("activity_logs").select("*")
            if role == "staff":
                query = query.eq("staff_visible", True)
            # side filter: side or both
            query = query.or_(f"side.eq.{side},side.eq.both")
            res = query.order("at").execute()
            if res.data:
                return [
                    LogRow(
                        id=r["id"],
                        kind=r["kind"],
                        action=r["action"],
                        actor=r["actor"],
                        reason=r["reason"],
                        at=r["at"],
                        staffVisible=r["staff_visible"],
                        side=r["side"]
                    )
                    for r in res.data
                ]
        except Exception as e:
            print("Supabase get_logs error:", e)
            
    filtered = [r for r in store.logs if r.side == side or r.side == "both"]
    if role == "staff":
        filtered = [r for r in filtered if r.staffVisible]
    return sorted(filtered, key=lambda x: x.at)

async def get_wakil(side: Side) -> WakilProfile:
    if supabase_client:
        try:
            biz_id = "mak-ngah" if side == "buyer" else "ayam-segar"
            res = supabase_client.table("wakil_profiles").select("*").eq("business_id", biz_id).execute()
            if res.data:
                r = res.data[0]
                return WakilProfile(
                    name=r["name"],
                    color=r["color"],
                    hat=r["hat"],
                    face=r["face"],
                    lang=r["lang"],
                    tone=r["tone"],
                    notes=r.get("notes", ""),
                    lookNote=r.get("look_note", "")
                )
        except Exception as e:
            print("Supabase get_wakil error:", e)
    return store.wakil[side]

async def save_wakil(side: Side, profile: WakilProfile) -> None:
    store.wakil[side] = profile
    if supabase_client:
        try:
            biz_id = "mak-ngah" if side == "buyer" else "ayam-segar"
            supabase_client.table("wakil_profiles").upsert({
                "business_id": biz_id,
                "side": side,
                "name": profile.name,
                "color": profile.color,
                "hat": profile.hat,
                "face": profile.face,
                "lang": profile.lang,
                "tone": profile.tone,
                "notes": profile.notes,
                "look_note": profile.lookNote
            }, on_conflict="business_id").execute()
        except Exception as e:
            print("Supabase save_wakil error:", e)
