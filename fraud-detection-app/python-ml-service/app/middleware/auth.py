"""
PHASE 4 — Authentication Middleware for Python ML Service
Validates the shared secret header on all protected endpoints.
Laravel must include: X-ML-Secret: {ML_SECRET} in all requests.
"""

import os
from fastapi import Header, HTTPException

ML_SECRET = os.getenv("ML_SECRET", "")


async def verify_ml_secret(x_ml_secret: str = Header(None)):
    """
    FastAPI dependency that validates the X-ML-Secret header.
    Inject as: Depends(verify_ml_secret)
    """
    if not ML_SECRET:
        raise HTTPException(
            status_code=500,
            detail="ML_SECRET environment variable not configured"
        )

    if x_ml_secret != ML_SECRET:
        raise HTTPException(
            status_code=401,
            detail="Invalid or missing X-ML-Secret header"
        )
