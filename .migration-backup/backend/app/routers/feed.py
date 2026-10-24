from fastapi import APIRouter, Query
from typing import List
from app.schemas import Side, Counterpart, PostRequestPayload, LogRow
from app.database import get_feed_cards, append_log, store

router = APIRouter(tags=["Feed"])

@router.get("/feed", response_model=List[Counterpart])
async def get_feed(side: Side = Query("buyer", description="Viewer side: buyer or supplier")):
    """
    Rule-based feed: buyers see suppliers, suppliers see buyer requests.
    """
    return await get_feed_cards(side)

@router.post("/requests")
async def post_request(payload: PostRequestPayload = PostRequestPayload()):
    """
    Kitchen lead posts a new weekly request. Logs the action.
    """
    store.posted_request = True
    row = LogRow(
        id=f"r_post_{int(store.deal.terms.weeklyTotal)}",
        side="buyer",
        kind="human",
        staffVisible=True,
        action=f"Posted request · {payload.qtyKgWeekly:.0f} kg chicken breast",
        actor="Aisyah · kitchen lead",
        reason="Weekly stock count",
        at="09:02"
    )
    await append_log(row, key="post:chicken")
    return {"ok": True}
