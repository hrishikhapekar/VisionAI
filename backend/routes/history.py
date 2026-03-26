"""
/history  – returns past analysis records.
"""
from fastapi import APIRouter
from utils.db import get_history

router = APIRouter()


@router.get("/history")
async def history(limit: int = 20):
    records = await get_history(limit)
    return {"count": len(records), "records": records}
