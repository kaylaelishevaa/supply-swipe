from fastapi import APIRouter
from app.database import store, supabase_client

router = APIRouter(tags=["Demo"])

@router.post("/demo/reset")
async def reset_demo_state():
    """
    Resets the demo state to initial seed both in-memory and in Supabase.
    """
    store.reset()
    if supabase_client:
        try:
            supabase_client.table("deal_approvals").delete().eq("deal_id", "SS-0142").execute()
            supabase_client.table("deals").update({
                "status": "proposed",
                "po_number": None,
                "asked_owner_at": None
            }).eq("id", "SS-0142").execute()
        except Exception as e:
            print("Supabase reset error:", e)
    return {"ok": True}
