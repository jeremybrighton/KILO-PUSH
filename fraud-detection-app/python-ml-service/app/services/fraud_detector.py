"""
PHASE 4 — Fraud Detector Service
Core ML prediction service. Loads the trained model and runs inference.

IMPORTANT: This is a scaffold with placeholder logic.
Replace the predict() method with your actual trained model from Phase 2.

Expected model interface:
  - Input: pandas DataFrame with transaction features
  - Output: array of fraud scores (0.0 to 1.0)

Supported model formats:
  - scikit-learn: joblib/pickle
  - XGBoost: .json or .ubj
  - LightGBM: .txt
  - PyTorch: .pt (with custom wrapper)
"""

import os
import logging
import pandas as pd
import numpy as np
from typing import List, Dict, Any

logger = logging.getLogger(__name__)

# Fraud score threshold — above this = flagged as fraud
FRAUD_THRESHOLD = float(os.getenv("FRAUD_THRESHOLD", "0.5"))

# Anomaly score threshold
ANOMALY_THRESHOLD = float(os.getenv("ANOMALY_THRESHOLD", "0.7"))

# Path to trained model file
MODEL_PATH = os.getenv("MODEL_PATH", "./models/fraud_model.pkl")


class FraudDetectorService:
    """
    Wraps the trained ML model for fraud prediction.
    Handles CSV loading, feature engineering, and prediction.
    """

    def __init__(self):
        self.model = self._load_model()

    def _load_model(self):
        """
        Load the trained model from disk.
        Replace this with your actual model loading logic from Phase 2.
        """
        if not os.path.exists(MODEL_PATH):
            logger.warning(
                f"Model file not found at {MODEL_PATH}. "
                "Using placeholder random predictions. "
                "Replace with your trained model from Phase 2."
            )
            return None

        try:
            import joblib
            model = joblib.load(MODEL_PATH)
            logger.info(f"Model loaded from {MODEL_PATH}")
            return model
        except Exception as e:
            logger.error(f"Failed to load model: {e}")
            return None

    async def predict(self, dataset_path: str) -> List[Dict[str, Any]]:
        """
        Run fraud detection on a CSV dataset.

        Args:
            dataset_path: Absolute path to the CSV file

        Returns:
            List of dicts with transaction_id, fraud_score, is_fraud, etc.
        """
        logger.info(f"Loading dataset from {dataset_path}")

        # Load CSV
        df = pd.read_csv(dataset_path)
        logger.info(f"Loaded {len(df)} rows from dataset")

        # Validate required columns
        if 'transaction_id' not in df.columns:
            raise ValueError("CSV must contain a 'transaction_id' column")

        # Run predictions
        if self.model is not None:
            fraud_scores = self._predict_with_model(df)
        else:
            # ── PLACEHOLDER: Replace with real model ──────────
            # This generates random scores for development/testing
            # until your Phase 2 model is integrated
            logger.warning("Using placeholder random predictions — replace with real model")
            fraud_scores = self._placeholder_predictions(df)

        # Build results list
        results = []
        for idx, row in df.iterrows():
            score = float(fraud_scores[idx])
            results.append({
                "transaction_id": str(row["transaction_id"]),
                "fraud_score":    round(score, 4),
                "is_fraud":       score >= FRAUD_THRESHOLD,
                "is_anomaly":     score >= ANOMALY_THRESHOLD,
                "vendor_id":      str(row.get("vendor_id", "")) or None,
                "vendor_name":    str(row.get("vendor_name", "")) or None,
                "region":         str(row.get("region", "")) or None,
                "amount":         float(row["amount"]) if "amount" in row and pd.notna(row["amount"]) else None,
            })

        fraud_count = sum(1 for r in results if r["is_fraud"])
        logger.info(f"Prediction complete: {fraud_count}/{len(results)} flagged as fraud")

        return results

    def _predict_with_model(self, df: pd.DataFrame) -> np.ndarray:
        """
        Run predictions using the loaded ML model.
        Adapt feature selection to match your Phase 2 model's training features.
        """
        # ── Feature engineering ───────────────────────────
        # Select and transform features to match training data
        # TODO: Replace with your actual feature columns from Phase 2
        feature_columns = [col for col in df.columns if col not in [
            'transaction_id', 'vendor_name', 'region', 'timestamp'
        ]]

        X = df[feature_columns].fillna(0)

        # Get probability scores (column 1 = fraud probability)
        if hasattr(self.model, 'predict_proba'):
            scores = self.model.predict_proba(X)[:, 1]
        else:
            scores = self.model.predict(X).astype(float)

        return scores

    def _placeholder_predictions(self, df: pd.DataFrame) -> np.ndarray:
        """
        Placeholder predictions for development.
        Generates realistic-looking fraud scores with ~5% fraud rate.
        REMOVE THIS and use _predict_with_model() in production.
        """
        np.random.seed(42)
        n = len(df)

        # 95% of transactions are low-risk (0.0 - 0.3)
        # 5% are high-risk (0.5 - 1.0)
        scores = np.where(
            np.random.random(n) < 0.05,
            np.random.uniform(0.5, 1.0, n),   # High risk
            np.random.uniform(0.0, 0.3, n)    # Low risk
        )

        return scores
