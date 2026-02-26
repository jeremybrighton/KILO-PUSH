"""
PHASE 4 — Python ML Microservice Entry Point
FastAPI application that exposes REST endpoints for fraud detection.
Receives dataset processing requests from Laravel and posts results back.

Architecture:
  Laravel → POST /process-dataset → Python processes → POST callback to Laravel
  Laravel → POST /explain         → Python generates SHAP → POST callback to Laravel

Run with:
  uvicorn main:app --host 0.0.0.0 --port 5000 --reload

Environment variables (see .env.example):
  ML_SECRET=your-shared-secret
  LARAVEL_CALLBACK_URL=http://laravel-app/api/internal
"""

from fastapi import FastAPI, HTTPException, Depends, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import logging

from app.routes.predict import router as predict_router
from app.routes.explain import router as explain_router
from app.routes.health import router as health_router
from app.middleware.auth import verify_ml_secret

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="FraudGuard ML Service",
    description="Python ML microservice for fraud detection. Called by Laravel backend.",
    version="1.0.0",
    docs_url="/docs",       # Swagger UI at /docs
    redoc_url="/redoc",
)

# CORS — only allow Laravel backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8000", "http://laravel-app"],
    allow_methods=["POST", "GET"],
    allow_headers=["X-ML-Secret", "Content-Type"],
)

# Register routers
app.include_router(health_router)
app.include_router(predict_router, dependencies=[Depends(verify_ml_secret)])
app.include_router(explain_router, dependencies=[Depends(verify_ml_secret)])

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=5000, reload=True)
