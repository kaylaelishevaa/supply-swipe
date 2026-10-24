import time
from fastapi import APIRouter, Query, HTTPException
from app.schemas import (
    Side, StartNegotiationRequest, StartNegotiationResponse, NegotiationView, LogRow
)
from app.database import (
    get_negotiation_view, get_own_limit, append_log, get_feed_cards, store, supabase_client
)
from app.services.negotiation_engine import DynamicNegotiationEngine

router = APIRouter(tags=["Negotiations"])

@router.post("/negotiations", response_model=StartNegotiationResponse)
async def start_negotiation(payload: StartNegotiationRequest):
    """
    Triggered when swiping right.
    In the demo dataset:
      - 'fresh-poultry' terminates with noDeal: True (floor exceeds max, 0 tokens used)
      - 'ayam-segar' triggers the dynamic Claude negotiation between the two Wakils.
    """
    side = payload.side
    counterpart_id = payload.counterpartId
    
    # Retrieve counterpart info for logging
    cards = await get_feed_cards(side)
    card = next((c for c in cards if c.id == counterpart_id), None)
    who = "Aisyah · kitchen lead" if side == "buyer" else "Sales rep · Ayam Segar"
    
    card_name = card.name.replace(" Enterprise", "") if card else counterpart_id
    reason = f"{card.fit}% fit, {card.why}" if card else ""
    at_time = "09:04" if counterpart_id == "ayam-segar" else None
    
    row = LogRow(
        id=f"r_swipe_{int(time.time()*1000)}",
        side=side,
        kind="human",
        staffVisible=True,
        action=f"Swiped right on {card_name}",
        actor=who,
        reason=reason,
        at=at_time or "09:04"
    )
    await append_log(row, key=f"swipe:{side}:{counterpart_id}")
    
    if counterpart_id == "fresh-poultry":
        return StartNegotiationResponse(id="n-0139", noDeal=True)

    # Run Live Dynamic Multi-Agent Negotiation via Claude!
    try:
        engine = DynamicNegotiationEngine()
        msgs, terms, deal_found = engine.run_dynamic_negotiation()
        if deal_found and msgs:
            # Update in-memory deal terms
            store.deal.terms = terms
            store.deal.status = "proposed"
            store.deal.approvals = []
            
            # Sync to Supabase if configured
            if supabase_client:
                try:
                    # Clear and insert new dynamic messages
                    supabase_client.table("negotiation_messages").delete().eq("negotiation_id", "n-0142").execute()
                    for m in msgs:
                        supabase_client.table("negotiation_messages").insert({
                            "negotiation_id": "n-0142",
                            "n": m.n,
                            "side": m.side,
                            "type": m.type,
                            "price_per_kg": m.pricePerKg,
                            "headline": m.headline,
                            "text": m.text,
                            "why": m.why,
                            "at": m.at
                        }).execute()
                    
                    # Update terms in deals table
                    supabase_client.table("deals").update({
                        "terms_price_per_kg": terms.pricePerKg,
                        "terms_weekly_total": terms.weeklyTotal,
                        "status": "proposed"
                    }).eq("id", "SS-0142").execute()
                except Exception as db_err:
                    print("Supabase dynamic messages sync error:", db_err)
    except Exception as e:
        print("Dynamic negotiation error, using fallback transcript:", e)

    return StartNegotiationResponse(id="n-0142", noDeal=False)

@router.post("/cards/skip")
async def skip_card(payload: StartNegotiationRequest):
    """
    Triggered when swiping left (skipping a card).
    """
    side = payload.side
    counterpart_id = payload.counterpartId
    cards = await get_feed_cards(side)
    card = next((c for c in cards if c.id == counterpart_id), None)
    
    row = LogRow(
        id=f"r_skip_{int(time.time()*1000)}",
        side=side,
        kind="human",
        staffVisible=True,
        action=f"Skipped {card.name if card else counterpart_id}",
        actor="Aisyah · kitchen lead" if side == "buyer" else "Sales rep · Ayam Segar",
        reason=card.why if card else "",
        at="09:04"
    )
    await append_log(row, key=f"skip:{side}:{counterpart_id}")
    return {"ok": True}

@router.get("/negotiations/{id}", response_model=NegotiationView)
async def get_negotiation(id: str, viewer: Side = Query("buyer", description="Viewer side: buyer or supplier")):
    """
    CRITICAL SECURITY GUARANTEE:
    Returns what ONE side may see of the negotiation.
    Only the viewer's OWN sealed limit is returned.
    The band's other end is estimated from public numbers.
    The counterpart's sealed limit is never present in this response.
    """
    return await get_negotiation_view(id, viewer)

@router.get("/limits/own")
async def get_own_limit_endpoint(side: Side = Query("buyer")):
    """
    Returns the caller's own sealed limit (buyer max or supplier floor).
    """
    limit = await get_own_limit(side)
    return limit
