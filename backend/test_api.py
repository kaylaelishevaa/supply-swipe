"""
Unit and Integration Test Suite for SupplySwipe FastAPI Backend
Verified against SDC Hackathon 2026 PRD Specifications
"""

import sys
import os

# Add backend directory to sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from fastapi.testclient import TestClient
from main import app
from app.guardrails import check_offer_within_limit, check_no_private_value
from app.services.feed_ranker import rank_suppliers_for_buyer
from app.services.negotiation_engine import NegotiationEngine

client = TestClient(app)

def test_guardrails():
    print("Testing Guardrails...")
    # 1. Offer within limit check
    ok, blocked_msg, reason = check_offer_within_limit("buyer", 12.60, 12.50)
    assert not ok, "Buyer offer 12.60 should be blocked if limit is 12.50"
    assert "RM12.60 is above your limit" in blocked_msg

    ok, _, _ = check_offer_within_limit("buyer", 12.20, 12.50)
    assert ok, "Buyer offer 12.20 should pass"

    ok, blocked_msg, _ = check_offer_within_limit("supplier", 11.50, 11.80)
    assert not ok, "Supplier offer 11.50 should be blocked if floor is 11.80"

    # 2. Anti-leakage check
    ok, leak_msg, _ = check_no_private_value("buyer", "I cannot go above RM12.50 per kg", 12.50)
    assert not ok, "Draft mentioning sealed max should be blocked"
    assert "would reveal your maximum" in leak_msg

    ok, _, _ = check_no_private_value("buyer", "Can you deliver on Monday morning?", 12.50)
    assert ok, "Safe draft should pass"
    print(" Guardrails pass!")

def test_feed_ranker_service():
    print("Testing PRD Rule-Based Feed Ranker...")
    buyer_request = {
        "qtyKgWeekly": 50.0,
        "targetPricePerKg": 13.00,
        "location": "Petaling Jaya",
        "days": ["Mon", "Thu"]
    }
    candidates = [
        {
            "id": "ayam-segar",
            "name": "Ayam Segar Enterprise",
            "listPricePerKg": 12.80,
            "moqKg": 30.0,
            "capacityKgWeekly": 200.0,
            "deliveryRoutes": ["Petaling Jaya", "Shah Alam"],
            "is_halal": True
        },
        {
            "id": "non-halal-supplier",
            "name": "Non Halal Supplier",
            "listPricePerKg": 11.00,
            "moqKg": 20.0,
            "capacityKgWeekly": 100.0,
            "deliveryRoutes": ["Petaling Jaya"],
            "is_halal": False  # Should be hard-filtered out!
        },
        {
            "id": "fresh-poultry",
            "name": "Fresh Poultry Puchong",
            "listPricePerKg": 13.80, # Above target
            "moqKg": 50.0,
            "capacityKgWeekly": 300.0,
            "deliveryRoutes": ["Petaling Jaya"],
            "is_halal": True
        }
    ]
    results = rank_suppliers_for_buyer(buyer_request, candidates, require_halal=True)
    # Non-halal supplier must be eliminated
    assert all(c.id != "non-halal-supplier" for c in results), "Non-halal supplier must be hard-filtered"
    assert len(results) == 2
    # Ayam Segar has higher fit than Fresh Poultry (within budget vs above budget)
    assert results[0].id == "ayam-segar"
    assert results[0].fit > results[1].fit
    print(" Feed ranker pass!")

def test_negotiation_engine_service():
    print("Testing PRD Autonomous Negotiation Engine...")
    # 1. Instant zero-token no-deal check (Fresh poultry floor 13.00 > buyer max 12.50)
    engine_no_deal = NegotiationEngine(
        buyer_id="mak-ngah",
        supplier_id="fresh-poultry",
        item="Chicken breast",
        qty_kg=50.0,
        market_price=12.10,
        buyer_max=12.50,
        buyer_target=13.00,
        supplier_floor=12.80, # Above buyer max!
        supplier_list=13.80
    )
    assert not engine_no_deal.can_reach_deal()
    msgs, terms, deal_found = engine_no_deal.run_negotiation()
    assert not deal_found
    assert len(msgs) == 0  # 0 tokens used!

    # 2. Successful negotiation (Ayam segar floor 11.80 <= buyer max 12.50)
    engine_deal = NegotiationEngine(
        buyer_id="mak-ngah",
        supplier_id="ayam-segar",
        item="Chicken breast",
        qty_kg=50.0,
        market_price=12.10,
        buyer_max=12.50,
        buyer_target=13.00,
        supplier_floor=11.80,
        supplier_list=12.80
    )
    assert engine_deal.can_reach_deal()
    msgs, terms, deal_found = engine_deal.run_negotiation()
    assert deal_found
    assert len(msgs) <= 10  # PRD invariant: at most 10 messages
    assert terms is not None
    assert terms.pricePerKg <= 12.50  # Must be inside buyer limit
    assert terms.pricePerKg >= 11.80  # Must be inside supplier floor
    print(" Negotiation Engine pass!")

def test_health():
    print("Testing Health Check...")
    res = client.get("/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"
    print(" Health check pass!")

def test_feed():
    print("Testing Feed...")
    res_b = client.get("/feed?side=buyer")
    assert res_b.status_code == 200
    buyer_cards = res_b.json()
    assert len(buyer_cards) == 3
    assert buyer_cards[0]["id"] == "ayam-segar"

    res_s = client.get("/feed?side=supplier")
    assert res_s.status_code == 200
    supplier_cards = res_s.json()
    assert len(supplier_cards) == 3
    assert supplier_cards[0]["id"] == "mak-ngah"
    print(" Feed pass!")

def test_confidential_limits_and_negotiation_view():
    print("Testing Confidential Limits Security Invariant...")
    # Buyer view
    res_b = client.get("/negotiations/n-0142?viewer=buyer")
    assert res_b.status_code == 200
    b_view = res_b.json()
    assert b_view["viewer"] == "buyer"
    assert b_view["ownLimitPerKg"] == 12.50  # Mak Ngah's max
    # Counterpart limit (supplier floor 11.80) MUST NOT be present
    assert "supplierFloor" not in b_view
    assert b_view["band"]["hi"] == 12.50

    # Supplier view
    res_s = client.get("/negotiations/n-0142?viewer=supplier")
    assert res_s.status_code == 200
    s_view = res_s.json()
    assert s_view["viewer"] == "supplier"
    assert s_view["ownLimitPerKg"] == 11.80  # Ayam Segar's floor
    assert "buyerMax" not in s_view
    assert s_view["band"]["lo"] == 11.80
    print(" Confidential limits pass!")

def test_start_negotiation_trigger():
    print("Testing Start Negotiation Trigger...")
    res1 = client.post("/negotiations", json={"side": "buyer", "counterpartId": "ayam-segar"})
    assert res1.status_code == 200
    assert res1.json() == {"id": "n-0142", "noDeal": False}

    res2 = client.post("/negotiations", json={"side": "buyer", "counterpartId": "fresh-poultry"})
    assert res2.status_code == 200
    assert res2.json() == {"id": "n-0139", "noDeal": True}
    print(" Start negotiation pass!")

def test_deals_and_approvals_workflow():
    print("Testing Deals & Approval Permissions...")
    client.post("/demo/reset")
    
    # 1. Staff limit enforcement
    res_staff = client.post("/deals/SS-0142/approve", json={"side": "buyer", "role": "staff"})
    assert res_staff.status_code == 200
    data_staff = res_staff.json()
    assert data_staff["ok"] is False
    assert data_staff["reason"] == "above_limit"

    # 2. Staff asks owner to approve
    res_ask = client.post("/deals/SS-0142/ask-owner", json={"side": "buyer", "role": "staff"})
    assert res_ask.status_code == 200
    assert "at" in res_ask.json()

    # 3. Buyer owner approves
    res_buyer_owner = client.post("/deals/SS-0142/approve", json={"side": "buyer", "role": "owner"})
    assert res_buyer_owner.status_code == 200
    data_bo = res_buyer_owner.json()
    assert data_bo["ok"] is True
    assert data_bo["deal"]["status"] == "buyer_approved"

    # 4. Supplier owner approves -> Deal must become SEALED with PO number
    res_supplier_owner = client.post("/deals/SS-0142/approve", json={"side": "supplier", "role": "owner"})
    assert res_supplier_owner.status_code == 200
    data_so = res_supplier_owner.json()
    assert data_so["ok"] is True
    assert data_so["deal"]["status"] == "sealed"
    assert data_so["deal"]["poNumber"] == "PO-2210-0142"
    print(" Deals & Approval Workflow pass!")

def test_undo_ask_owner():
    print("Testing Undo of Ask Owner...")
    client.post("/demo/reset")
    ask = {"side": "buyer", "role": "staff"}
    asked_rows = lambda: [
        r for r in client.get("/log?side=buyer&role=staff").json() if r["action"] == "Asked Mak Ngah to approve"
    ]
    initial_count = len(asked_rows())

    client.post("/deals/SS-0142/ask-owner", json=ask)
    assert client.get("/deals/SS-0142").json()["askedOwnerAt"] is not None

    res_undo = client.post("/deals/SS-0142/undo-ask-owner", json=ask)
    assert res_undo.status_code == 200
    assert client.get("/deals/SS-0142").json()["askedOwnerAt"] is None
    staff_log = client.get("/log?side=buyer&role=staff").json()
    assert any(r["action"] == "Cancelled request to owner" for r in staff_log)

    # Asking again after an undo is a new request, so it is logged again
    client.post("/deals/SS-0142/ask-owner", json=ask)
    assert len(asked_rows()) == initial_count + 2
    print(" Undo ask owner pass!")

def test_invoice_comparison():
    print("Testing PRD Invoice Line-by-Line Comparison...")
    res = client.get("/deals/SS-0142/invoice")
    assert res.status_code == 200
    data = res.json()
    assert data["mismatches"] == 2
    assert data["overpay"] == 25.0  # RM635 invoice vs RM610 agreed
    assert any(r["key"] == "price" and r["bad"] for r in data["rows"])
    assert any(r["key"] == "delivery" and r["bad"] for r in data["rows"])
    print(" Invoice comparison pass!")

def test_history_and_memory():
    print("Testing PRD Memory & History Endpoint...")
    res = client.get("/history/ayam-segar")
    assert res.status_code == 200
    data = res.json()
    assert "memory" in data
    assert "3 of 3 drops on time" in data["memory"]
    assert data["currentWeek"] == 3
    print(" History & Memory pass!")

def test_activity_log_role_visibility():
    print("Testing Activity Log Role Filtering...")
    res_owner = client.get("/log?side=buyer&role=owner")
    assert res_owner.status_code == 200
    owner_logs = res_owner.json()

    res_staff = client.get("/log?side=buyer&role=staff")
    assert res_staff.status_code == 200
    staff_logs = res_staff.json()

    assert len(staff_logs) <= len(owner_logs)
    for r in staff_logs:
        assert r["staffVisible"] is True
    print(" Activity log filtering pass!")

def test_wakil_customization():
    print("Testing Wakil Customization...")
    res = client.get("/wakil/buyer")
    assert res.status_code == 200
    profile = res.json()
    assert profile["name"] == "Wakil Mak Ngah"

    profile["hat"] = "songkok"
    profile["notes"] = "Drops must be strictly before 8am."
    res_put = client.put("/wakil/buyer", json=profile)
    assert res_put.status_code == 200

    res_updated = client.get("/wakil/buyer")
    assert res_updated.status_code == 200
    assert res_updated.json()["hat"] == "songkok"
    assert res_updated.json()["notes"] == "Drops must be strictly before 8am."
    print(" Wakil customization pass!")

if __name__ == "__main__":
    test_guardrails()
    test_feed_ranker_service()
    test_negotiation_engine_service()
    test_health()
    test_feed()
    test_confidential_limits_and_negotiation_view()
    test_start_negotiation_trigger()
    test_deals_and_approvals_workflow()
    test_undo_ask_owner()
    test_invoice_comparison()
    test_history_and_memory()
    test_activity_log_role_visibility()
    test_wakil_customization()
    print("\nALL PRD BACKEND TESTS PASSED SUCCESSFULLY! ")
