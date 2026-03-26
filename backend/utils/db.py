"""
In-memory history store — resets when the server restarts.
No database dependency required.
"""
from datetime import datetime, timezone

_history: list[dict] = []


async def save_history(record: dict) -> None:
    record["created_at"] = datetime.now(timezone.utc).isoformat()
    _history.append(record)


async def get_history(limit: int = 20) -> list[dict]:
    return list(reversed(_history))[:limit]
