"""
PHASE 4 — Callback Service
Handles HTTP callbacks from Python ML service back to Laravel.
After processing, Python POSTs results to Laravel's internal API endpoints.
"""

import os
import logging
import httpx
from typing import List, Dict, Any, Optional

logger = logging.getLogger(__name__)

# Shared secret for authenticating callbacks to Laravel
ML_SECRET = os.getenv("ML_SECRET", "")

# Timeout for callback requests (seconds)
CALLBACK_TIMEOUT = int(os.getenv("CALLBACK_TIMEOUT", "30"))


class CallbackService:
    """
    Sends processing results back to Laravel via HTTP POST.
    Uses the shared ML_SECRET header for authentication.
    """

    async def post_results(
        self,
        callback_url: str,
        dataset_id: int,
        job_id: str,
        status: str,
        results: List[Dict[str, Any]],
        error_message: Optional[str] = None
    ) -> bool:
        """
        POST fraud detection results to Laravel.

        Args:
            callback_url: Laravel endpoint (e.g. http://app/api/internal/ml-results)
            dataset_id: ID of the processed dataset
            job_id: UUID for correlation
            status: 'success' or 'failed'
            results: List of fraud result dicts
            error_message: Error description if status is 'failed'

        Returns:
            True if callback succeeded, False otherwise
        """
        payload = {
            "dataset_id":    dataset_id,
            "job_id":        job_id,
            "status":        status,
            "results":       results if status == "success" else [],
            "error_message": error_message,
        }

        return await self._post(callback_url, payload)

    async def post_explanations(
        self,
        callback_url: str,
        dataset_id: int,
        explanations: List[Dict[str, Any]]
    ) -> bool:
        """
        POST SHAP explanations to Laravel.

        Args:
            callback_url: Laravel endpoint (e.g. http://app/api/internal/ml-explain)
            dataset_id: ID of the processed dataset
            explanations: List of SHAP explanation dicts
        """
        payload = {
            "dataset_id":   dataset_id,
            "explanations": explanations,
        }

        return await self._post(callback_url, payload)

    async def _post(self, url: str, payload: dict) -> bool:
        """
        Internal HTTP POST with authentication header and error handling.
        """
        headers = {
            "X-ML-Secret":  ML_SECRET,
            "Content-Type": "application/json",
            "Accept":       "application/json",
        }

        try:
            async with httpx.AsyncClient(timeout=CALLBACK_TIMEOUT) as client:
                response = await client.post(url, json=payload, headers=headers)

                if response.status_code == 200:
                    logger.info(f"Callback to {url} succeeded")
                    return True
                else:
                    logger.error(
                        f"Callback to {url} failed with status {response.status_code}: "
                        f"{response.text[:200]}"
                    )
                    return False

        except httpx.ConnectError:
            logger.error(f"Cannot connect to Laravel at {url}. Is it running?")
            return False
        except httpx.TimeoutException:
            logger.error(f"Callback to {url} timed out after {CALLBACK_TIMEOUT}s")
            return False
        except Exception as e:
            logger.error(f"Callback to {url} failed: {e}")
            return False
