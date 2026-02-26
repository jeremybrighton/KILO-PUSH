# Active Context: FraudGuard ML Fraud Detection System

## Current State

**Project Status**: ✅ Phases 3–7 scaffolding complete + Next.js frontend live

The project has been transformed from a blank Next.js template into a full FraudGuard
ML fraud detection system. The Next.js frontend is live and connects to a Flask ML
microservice via ngrok tunnel.

## Flask ML Service (Active)
- **Ngrok URL**: `https://scientistic-subcheliform-syreeta.ngrok-free.dev`
- **Local**: `http://localhost:5000`
- **Framework**: Flask (Python 3.11)

## Recently Completed

- [x] Phase 3: Laravel Core System scaffolding
  - AuthController (login, register, RBAC, password reset)
  - DatasetController (CSV upload, validation, job dispatch)
  - JobController (queue monitoring, retry)
  - AdminController (user management, role assignment)
  - MetadataController (audit trail)
  - RoleMiddleware (admin/analyst/vendor)
  - MlApiSecretMiddleware (shared secret auth)
  - Models: User, Dataset, FraudResult, FraudExplanation, JobLog, AuditLog
  - 6 database migrations with indexes
  - Blade views: login, dashboard, upload, fraud-map, time-series, explainability
  - Routes: web.php + api.php

- [x] Phase 4: Laravel ↔ Python Integration
  - ProcessDatasetJob (async, 3 retries, 10min timeout)
  - MlApiService (HTTP client, shared secret, retry logic)
  - FraudResultApiController (ML callback receiver)
  - ExplainabilityApiController (SHAP callback receiver)
  - config/services.php with ML service config

- [x] Phase 4: Python ML Microservice (FastAPI)
  - main.py (FastAPI app with CORS)
  - /process-dataset, /explain, /health endpoints
  - FraudDetectorService (model loading + placeholder predictions)
  - ShapExplainerService (SHAP integration)
  - CallbackService (async HTTP POST back to Laravel)
  - Dockerfile, requirements.txt

- [x] Phase 5: Analytics Dashboards (Next.js)
  - /dashboard: geo risk, vendor rankings, time-series bar chart
  - Placeholder data ready for real ML results

- [x] Phase 6: Explainability (Next.js)
  - /explain: SHAP feature importance visualization
  - Human-readable narrative display
  - Demo mode (works without ML service)

- [x] Phase 7: Deployment
  - docker-compose.yml (Laravel, Python, Nginx, MySQL, Redis, queue worker)
  - Nginx config with SSL placeholder
  - .env.example files

- [x] Next.js Frontend (fixes blank app)
  - Home page with navigation
  - /upload: CSV → Flask ngrok → fraud results table
  - /api-test: Flask connectivity tester + code snippets
  - /dashboard: Phase 5 analytics
  - /explain: Phase 6 SHAP explainability

## Current File Structure

| Path | Purpose | Status |
|------|---------|--------|
| `src/app/page.tsx` | Home/landing page | ✅ Live |
| `src/app/upload/page.tsx` | CSV upload + ML results | ✅ Live |
| `src/app/dashboard/page.tsx` | Analytics dashboard | ✅ Live |
| `src/app/explain/page.tsx` | SHAP explainability | ✅ Live |
| `src/app/api-test/page.tsx` | Flask API tester | ✅ Live |
| `fraud-detection-app/` | Laravel scaffolding | ✅ Ready |
| `fraud-detection-app/python-ml-service/` | FastAPI scaffolding | ✅ Ready |

## What's Needed Next

1. **Connect real ML model**: Replace placeholder in `fraud_detector.py` with Phase 2 model
2. **Add /predict endpoint to Flask**: The Next.js upload page calls `POST /predict`
3. **Add /explain endpoint to Flask**: The explain page calls `GET /explain/<id>`
4. **Laravel setup**: Run `composer install`, `php artisan migrate`, configure `.env`

## Flask Endpoints Expected by Frontend

| Method | Path | Called by |
|--------|------|-----------|
| GET | /health | Dashboard (status check) |
| POST | /predict | Upload page (fraud detection) |
| GET | /explain/<id> | Explain page (SHAP) |

## Session History

| Date | Changes |
|------|---------|
| Initial | Template created with base setup |
| 2026-02-26 | Full phases 3-7 scaffolding + Next.js dashboard with Flask ngrok integration |
