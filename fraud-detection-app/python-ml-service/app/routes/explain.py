"""
PHASE 6 — Explainability Route
Receives explanation requests from Laravel and generates SHAP values.
"""

import logging
from fastapi import APIRouter, BackgroundTasks
from pydantic import BaseModel

from app.services.shap_explainer import ShapExplainerService
from app.services.callback_service import CallbackService

logger = logging.getLogger(__name__)
router = APIRouter()


class ExplainRequest(BaseModel):
    dataset_id: int
    job_id: str
    callback_url: str   # Laravel endpoint: /api/internal/ml-explain


@router.post("/explain")
async def explain_dataset(
    request: ExplainRequest,
    background_tasks: BackgroundTasks
):
    """
    Generates SHAP explanations for all flagged transactions in a dataset.
    Runs in background and POSTs results to Laravel callback URL.
    """
    logger.info(f"Received explanation request for dataset {request.dataset_id}")

    background_tasks.add_task(
        _explain_and_callback,
        request.dataset_id,
        request.job_id,
        request.callback_url
    )

    return {
        "status": "accepted",
        "message": "Explanation generation queued",
        "job_id": request.job_id
    }


async def _explain_and_callback(dataset_id: int, job_id: str, callback_url: str):
    """
    Generates SHAP explanations and POSTs them to Laravel.
    """
    explainer = ShapExplainerService()
    callback = CallbackService()

    try:
        # TODO: Load the dataset and fraud results for this dataset_id
        # In production, fetch from shared storage or database
        # For now, this is a placeholder
        explanations = []  # Replace with actual SHAP computation

        await callback.post_explanations(
            callback_url=callback_url,
            dataset_id=dataset_id,
            explanations=explanations
        )

    except Exception as e:
        logger.error(f"Explanation generation failed for dataset {dataset_id}: {e}")
