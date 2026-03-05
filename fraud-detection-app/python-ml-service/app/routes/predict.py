"""
PHASE 4 — Prediction Route
Receives dataset processing requests from Laravel.
Loads the CSV, runs the ML model, and POSTs results back to Laravel.

Data flow:
  Laravel Job → POST /process-dataset → this route
  This route → background task → POST /api/internal/ml-results → Laravel

Also supports direct prediction via POST /predict for Next.js frontend.
"""

import logging
import asyncio
from fastapi import APIRouter, BackgroundTasks, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import httpx

from app.services.fraud_detector import FraudDetectorService
from app.services.callback_service import CallbackService

logger = logging.getLogger(__name__)
router = APIRouter()

# ── Request schema for direct prediction ───────────────────────
class TransactionInput(BaseModel):
    transaction_id: str
    amount: float
    vendor_id: str
    vendor_name: Optional[str] = None
    region: Optional[str] = None
    timestamp: Optional[str] = None
    card_present: Optional[bool] = None
    online_transaction: Optional[bool] = None
    transaction_count_1h: Optional[int] = 0
    avg_transaction_amount_24h: Optional[float] = 0.0

class PredictRequest(BaseModel):
    transactions: List[TransactionInput]


# ── POST /predict — Direct prediction for Next.js frontend ────
@router.post("/predict")
async def predict(request: PredictRequest):
    """
    Accepts transaction JSON directly from Next.js frontend.
    Returns fraud predictions immediately (no background processing).
    """
    logger.info(f"Received direct prediction request for {len(request.transactions)} transactions")
    
    detector = FraudDetectorService()
    
    try:
        # Run fraud detection on the transactions
        results = await detector.predict_transactions(request.transactions)
        
        return {
            "status": "success",
            "predictions": results
        }
    except Exception as e:
        logger.error(f"Prediction failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ── Request schema for batch processing ────────────────────────
class ProcessDatasetRequest(BaseModel):
    dataset_id: int
    dataset_path: str       # Absolute path to CSV file on shared storage
    job_id: str             # UUID for correlation
    callback_url: str       # Laravel endpoint to POST results to


# ── POST /process-dataset ─────────────────────────────
@router.post("/process-dataset")
async def process_dataset(
    request: ProcessDatasetRequest,
    background_tasks: BackgroundTasks
):
    """
    Accepts a dataset processing request from Laravel.
    Immediately returns 202 Accepted, then processes in background.
    Results are POSTed back to Laravel via callback_url.
    """
    logger.info(f"Received processing request for dataset {request.dataset_id}, job {request.job_id}")

    # Validate file exists
    import os
    if not os.path.exists(request.dataset_path):
        raise HTTPException(
            status_code=404,
            detail=f"Dataset file not found: {request.dataset_path}"
        )

    # Process in background — don't block the HTTP response
    background_tasks.add_task(
        _process_and_callback,
        request.dataset_id,
        request.dataset_path,
        request.job_id,
        request.callback_url
    )

    return {
        "status": "accepted",
        "message": "Dataset queued for processing",
        "job_id": request.job_id
    }


# ── Background processing task ────────────────────────
async def _process_and_callback(
    dataset_id: int,
    dataset_path: str,
    job_id: str,
    callback_url: str
):
    """
    Runs ML fraud detection on the dataset and POSTs results to Laravel.
    This runs asynchronously after the HTTP response is sent.
    """
    detector = FraudDetectorService()
    callback = CallbackService()

    try:
        logger.info(f"Starting ML processing for dataset {dataset_id}")

        # Run fraud detection — replace with your actual ML model
        results = await detector.predict(dataset_path)

        logger.info(f"ML processing complete: {len(results)} records processed")

        # POST results back to Laravel
        await callback.post_results(
            callback_url=callback_url,
            dataset_id=dataset_id,
            job_id=job_id,
            status="success",
            results=results
        )

    except Exception as e:
        logger.error(f"ML processing failed for dataset {dataset_id}: {e}")

        # Notify Laravel of failure
        await callback.post_results(
            callback_url=callback_url,
            dataset_id=dataset_id,
            job_id=job_id,
            status="failed",
            results=[],
            error_message=str(e)
        )
