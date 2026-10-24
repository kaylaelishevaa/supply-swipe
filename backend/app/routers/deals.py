import time
from fastapi import APIRouter, HTTPException, Path
from app.schemas import (
    Side, Role, Deal, Approval, ApproveRequest, ApproveResponse, RejectRequest, CounterRequest, LogRow
)
from app.database import get_deal, save_deal, append_log, store, STAFF_LIMITS

router = APIRouter(tags=["Deals"])

def actor_label(side: Side, role: Role) -> str:
    if role == "owner":
        return "Mak Ngah · owner" if side == "buyer" else "Encik Roslan · owner, Ayam Segar"
    return "Aisyah · kitchen lead" if side == "buyer" else "Sales rep · Ayam Segar"

def owner_name(side: Side) -> str:
    return "Mak Ngah" if side == "buyer" else "Encik Roslan"

def user_name(side: Side, role: Role) -> str:
    if role == "owner":
        return owner_name(side)
    return "Aisyah" if side == "buyer" else "Sales rep"

@router.get("/deals/{id}", response_model=Deal)
async def get_deal_endpoint(id: str = Path(..., description="Deal ID, e.g. SS-0142")):
    deal = await get_deal(id)
    return deal

@router.post("/deals/{id}/approve", response_model=ApproveResponse)
async def approve_deal(id: str, payload: ApproveRequest):
    """
    Enforces staff limits and seals deal when both sides approve.
    Staff can approve only up to RM500 (buyer) or RM300 (supplier).
    """
    side = payload.side
    role = payload.role
    deal = await get_deal(id)
    
    if deal.status == "rejected":
        return ApproveResponse(ok=False, reason="rejected")
    
    # Check staff authorization threshold
    limit = float("inf") if role == "owner" else STAFF_LIMITS[side]
    if deal.terms.weeklyTotal > limit:
        return ApproveResponse(ok=False, reason="above_limit")
        
    if any(a.side == side for a in deal.approvals):
        return ApproveResponse(ok=False, reason="already")
        
    at_time = (
        ("09:11" if side == "buyer" else "09:20")
        if role == "owner"
        else "09:07"
    )
    
    # Register approval
    deal.approvals.append(Approval(
        by=user_name(side, role),
        side=side,
        role=role,
        at=at_time
    ))
    
    reason = (
        ("Above staff limit RM500" if role == "owner" else "Under staff limit RM500")
        if side == "buyer"
        else ("Above floor, new PJ route" if role == "owner" else "Under rep limit RM300")
    )
    
    await append_log(
        LogRow(
            id=f"r_appr_{int(time.time()*1000)}",
            side="both",
            kind="approval",
            staffVisible=(role == "staff"),
            action=f"Approved RM{deal.terms.weeklyTotal:.0f} per week" if side == "buyer" else "Approved",
            actor=actor_label(side, role),
            reason=reason,
            at=at_time
        ),
        key=f"approve:{deal.id}:{side}"
    )
    
    has_buyer = any(a.side == "buyer" for a in deal.approvals)
    has_supplier = any(a.side == "supplier" for a in deal.approvals)
    
    if has_buyer and has_supplier:
        deal.status = "sealed"
        deal.poNumber = "PO-2210-0142"
        
        await append_log(
            LogRow(
                id=f"r_seal_{int(time.time()*1000)}",
                side="both",
                kind="approval",
                staffVisible=False,
                action="Deal record created",
                actor="SupplySwipe · system",
                reason="Both owners approved",
                at="09:20"
            ),
            key=f"sealed:{deal.id}"
        )
        await append_log(
            LogRow(
                id=f"r_mem_{int(time.time()*1000)}",
                side="buyer",
                kind="agent",
                staffVisible=False,
                action="Saved memory",
                actor="Wakil Mak Ngah · agent",
                reason="Ayam Segar takes 7-day terms; trial until 5 Nov",
                at="09:20"
            ),
            key=f"memory:{deal.id}:buyer"
        )
    else:
        deal.status = "buyer_approved" if side == "buyer" else "supplier_approved"
        
    await save_deal(deal)
    return ApproveResponse(ok=True, deal=deal)

@router.post("/deals/{id}/reject")
async def reject_deal(id: str, payload: RejectRequest):
    deal = await get_deal(id)
    deal.status = "rejected"
    await save_deal(deal)
    
    await append_log(
        LogRow(
            id=f"r_rej_{int(time.time()*1000)}",
            side="both",
            kind="approval",
            staffVisible=(payload.role == "staff"),
            action="Rejected deal",
            actor=actor_label(payload.side, payload.role),
            reason=payload.reason or "No reason given",
            at="09:15"
        )
    )
    return {"ok": True}

@router.post("/deals/{id}/ask-owner")
async def ask_owner(id: str, payload: ApproveRequest):
    deal = await get_deal(id)
    side = payload.side
    at_time = "09:08" if side == "buyer" else "09:08"
    deal.askedOwnerAt = at_time
    await save_deal(deal)
    
    await append_log(
        LogRow(
            id=f"r_ask_{int(time.time()*1000)}",
            side=side,
            kind="human",
            staffVisible=True,
            action=f"Asked {owner_name(side)} to approve",
            actor=actor_label(side, "staff"),
            reason=f"RM{deal.terms.weeklyTotal:.0f} is above the staff limit RM{STAFF_LIMITS[side]:.0f}",
            at=at_time
        ),
        key=f"ask:{deal.id}:{side}"
    )
    return {"at": at_time}

@router.post("/deals/{id}/undo-ask-owner")
async def undo_ask_owner(id: str, payload: ApproveRequest):
    """
    Cancels the staff request to the owner. Asking again afterwards is logged as a new request.
    """
    deal = await get_deal(id)
    side = payload.side
    deal.askedOwnerAt = None
    await save_deal(deal)
    store.log_keys.discard(f"ask:{deal.id}:{side}")

    await append_log(
        LogRow(
            id=f"r_undo_{int(time.time()*1000)}",
            side=side,
            kind="human",
            staffVisible=True,
            action="Cancelled request to owner",
            actor=actor_label(side, "staff"),
            reason="Undo within the same minute",
            at="09:08"
        )
    )
    return {"ok": True}

@router.post("/deals/{id}/counter")
async def counter_via_wakil(id: str, payload: CounterRequest):
    deal = await get_deal(id)
    side = payload.side
    role = payload.role
    
    await append_log(
        LogRow(
            id=f"r_cnt_{int(time.time()*1000)}",
            side=side,
            kind="human",
            staffVisible=(role == "staff"),
            action="Sent a counter note to Wakil",
            actor=actor_label(side, role),
            reason=payload.note[:80],
            at="09:12"
        )
    )
    wakil_name = "Wakil Mak Ngah" if side == "buyer" else "Wakil Ayam Segar"
    await append_log(
        LogRow(
            id=f"r_cnt_agent_{int(time.time()*1000)}",
            side=side,
            kind="agent",
            staffVisible=False,
            action="Resumed negotiation · up to 4 more messages",
            actor=f"{wakil_name} · agent",
            reason="Your note guides wording. Limits stay sealed.",
            at="09:12"
        )
    )
    return {"ok": True}


@router.get("/deals/{id}/invoice")
async def get_deal_invoice_comparison(id: str):
    """
    PRD Requirement: Compare supplier invoice line by line with pinned terms.
    Flags mismatches and calculates overpayment before payment.
    """
    deal = await get_deal(id)
    # Synthetic invoice INV-8841 received from Ayam Segar
    inv = {
        "id": "INV-8841",
        "qtyKg": 50.0,
        "pricePerKg": 12.50,
        "deliveryFee": 10.0,
        "paymentDays": 7,
        "period": "week of 27 Oct"
    }
    
    agreed_delivery = 0.0 if deal.terms.qtyKgWeekly > 40 else 10.0
    agreed_total = deal.terms.qtyKgWeekly * deal.terms.pricePerKg + agreed_delivery
    invoice_total = inv["qtyKg"] * inv["pricePerKg"] + inv["deliveryFee"]
    
    rows = [
        {
            "key": "qty",
            "label": "Chicken breast · weekly",
            "agreed": f"{deal.terms.qtyKgWeekly:.0f} kg",
            "invoice": f"{inv['qtyKg']:.0f} kg",
            "bad": inv["qtyKg"] != deal.terms.qtyKgWeekly
        },
        {
            "key": "price",
            "label": "Price per kg",
            "agreed": f"RM{deal.terms.pricePerKg:.2f}",
            "invoice": f"RM{inv['pricePerKg']:.2f}",
            "bad": inv["pricePerKg"] != deal.terms.pricePerKg
        },
        {
            "key": "delivery",
            "label": "Delivery",
            "agreed": "Free" if agreed_delivery == 0 else f"RM{agreed_delivery:.2f}",
            "invoice": "Free" if inv["deliveryFee"] == 0 else f"RM{inv['deliveryFee']:.2f}",
            "bad": inv["deliveryFee"] != agreed_delivery
        },
        {
            "key": "terms",
            "label": "Terms",
            "agreed": f"{deal.terms.paymentDays} days",
            "invoice": f"{inv['paymentDays']} days",
            "bad": inv["paymentDays"] != deal.terms.paymentDays
        }
    ]
    
    mismatches = sum(1 for r in rows if r["bad"])
    overpay = invoice_total - agreed_total
    
    return {
        "invoice": inv,
        "agreedTotal": agreed_total,
        "invoiceTotal": invoice_total,
        "mismatches": mismatches,
        "overpay": overpay,
        "rows": rows
    }

@router.get("/history/{counterpart_id}")
async def get_counterpart_history(counterpart_id: str):
    """
    PRD Requirement: Loads memories of past dealings so next week's renegotiation is faster.
    """
    return {
        "counterpartId": counterpart_id,
        "name": "Ayam Segar Enterprise",
        "item": "Chicken breast · since 22 Oct",
        "currentWeek": 3,
        "alert": "Price moved",
        "alertDetail": "Ayam Segar raised list to RM13.10/kg. Market is now RM12.40.",
        "memory": "Ayam Segar takes 7-day terms. 3 of 3 drops on time. Moves RM0.30 for a standing order.",
        "pastWeeks": [
            {"week": "Week 2", "note": "Renewed · 4 messages", "price": "RM12.20"},
            {"week": "Week 1", "note": "2-week trial · 6 messages", "price": "RM12.30"}
        ]
    }
