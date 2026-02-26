"""PHASE 4 — Health Check Route"""
from fastapi import APIRouter
from datetime import datetime

router = APIRouter()

@router.get("/health")
async def health():
    return {"status": "ok", "service": "ml-service", "timestamp": datetime.utcnow().isoformat()}
