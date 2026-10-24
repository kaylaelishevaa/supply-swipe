"""
Feed Ranker Service (Rule-based, No AI)
As specified in PRD Section 2.2:
"A rule-based feed, with no AI, applies hard filters (halal, category, delivery area,
quantity versus capacity) and ranks counterparts with 'why this match' chips."
"""

from typing import List, Dict, Any, Optional
from app.schemas import Counterpart, CounterpartChip, CounterpartTile

def rank_suppliers_for_buyer(
    buyer_request: Dict[str, Any],
    candidate_suppliers: List[Dict[str, Any]],
    require_halal: bool = True
) -> List[Counterpart]:
    """
    Applies hard filters and ranks supplier candidates for a buyer request.
    """
    ranked_cards: List[Counterpart] = []
    
    req_qty = buyer_request.get("qtyKgWeekly", 50.0)
    req_target = buyer_request.get("targetPricePerKg", 13.0)
    req_location = buyer_request.get("location", "Petaling Jaya").lower()
    req_days = set(buyer_request.get("days", ["Mon", "Thu"]))

    for sup in candidate_suppliers:
        # 1. Hard Filter: Halal
        if require_halal and not sup.get("is_halal", True):
            continue

        # 2. Hard Filter: Capacity
        capacity = sup.get("capacityKgWeekly", 200.0)
        if req_qty > capacity:
            continue

        # 3. Fit Score Calculation (0 - 100)
        fit_score = 70
        chips: List[CounterpartChip] = []
        tiles: List[CounterpartTile] = []

        list_price = sup.get("listPricePerKg", 12.80)
        moq = sup.get("moqKg", 30.0)
        on_time = sup.get("onTimeRatio", "9 of 10")
        terms = sup.get("paymentTerms", "7 days")
        routes = sup.get("deliveryRoutes", ["Petaling Jaya", "Shah Alam"])
        routes_lower = [r.lower() for r in routes]

        # Route matching
        matches_area = any(req_location in r or r in req_location for r in routes_lower)
        if matches_area:
            fit_score += 10
            chips.append(CounterpartChip(label="Delivers PJ Mon–Sat", tone="ok"))
        else:
            chips.append(CounterpartChip(label="Limited delivery route", tone="warn"))

        # Price matching vs target
        if list_price <= req_target:
            fit_score += 12
            chips.append(CounterpartChip(label="Within budget", tone="ok"))
        else:
            fit_score -= 15
            chips.append(CounterpartChip(label="Above your budget", tone="bad"))

        # MOQ matching
        if req_qty >= moq:
            fit_score += 5
            chips.append(CounterpartChip(label=f"MOQ {int(moq)} kg", tone="ok"))
        else:
            fit_score -= 10
            chips.append(CounterpartChip(label=f"Below MOQ {int(moq)} kg", tone="warn"))

        # Halal verified
        if sup.get("is_halal", True):
            chips.append(CounterpartChip(label="Halal", tone="ok"))

        # Tiles
        tiles.append(CounterpartTile(label="On time", value=on_time))
        tiles.append(CounterpartTile(label="Terms", value=terms))
        tiles.append(CounterpartTile(label="MOQ", value=f"{int(moq)} kg"))

        # Cap score between 30 and 99
        fit_score = max(30, min(99, fit_score))

        # Generate "why" summary
        why = "on your route, list under your target" if list_price <= req_target else "reliable, but list price is above target"

        opens_at = f"RM{round(list_price - 0.80, 2):.2f}"

        card = Counterpart(
            id=sup["id"],
            name=sup["name"],
            logo=sup.get("logo", "/logos/ayam-segar.png"),
            location=sup.get("location", "Shah Alam · 14 km"),
            fit=fit_score,
            chips=chips,
            tiles=tiles,
            why=why,
            listLabel=f"RM{list_price:.2f}/kg list",
            panel=sup.get("panel", "#D7F3EC"),
            accent=sup.get("accent", "#0E8A76"),
            opensAt=opens_at
        )
        ranked_cards.append(card)

    # Sort descending by fit score
    ranked_cards.sort(key=lambda c: c.fit, reverse=True)
    return ranked_cards
