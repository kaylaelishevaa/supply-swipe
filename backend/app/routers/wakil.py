from fastapi import APIRouter, Path
from app.schemas import Side, WakilProfile
from app.database import get_wakil, save_wakil

router = APIRouter(tags=["Wakil Profile"])

@router.get("/wakil/{side}", response_model=WakilProfile)
async def get_wakil_profile(side: Side = Path(..., description="buyer or supplier")):
    """
    Get the configured Wakil avatar & personality for the given side.
    """
    return await get_wakil(side)

@router.put("/wakil/{side}")
async def update_wakil_profile(side: Side, profile: WakilProfile):
    """
    Updates the Wakil avatar look, tone, language, and custom owner notes.
    Owner notes influence wording only; prices and limits are strictly sealed.
    """
    await save_wakil(side, profile)
    return {"ok": True}
