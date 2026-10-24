import time
from fastapi import APIRouter, Query
from typing import List
from app.schemas import Side, Role, LogRow, LogRowCreate
from app.database import get_logs, append_log

router = APIRouter(tags=["Activity Log"])

@router.get("/log", response_model=List[LogRow])
async def get_activity_log(
    side: Side = Query("buyer", description="Viewer side: buyer or supplier"),
    role: Role = Query("owner", description="Viewer role: owner or staff")
):
    """
    Append-only log viewer:
    - Owners see all rows for their side (plus 'both').
    - Staff see only rows with staff_visible == True.
    """
    return await get_logs(side, role)

@router.post("/log")
async def add_log_entry(payload: LogRowCreate):
    """
    Append an immutable event to the audit log.
    """
    row_id = f"r{int(time.time()*1000)}"
    at_time = payload.at or "09:10"
    row = LogRow(
        id=row_id,
        side=payload.side,
        kind=payload.kind,
        action=payload.action,
        actor=payload.actor,
        reason=payload.reason,
        at=at_time,
        staffVisible=payload.staffVisible
    )
    await append_log(row, key=payload.key)
    return {"ok": True, "id": row_id}
