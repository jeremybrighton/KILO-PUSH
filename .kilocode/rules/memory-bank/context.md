# Active Context: FraudGuard ML Fraud Detection System

## Current State

**Project Status**: ✅ Authentication system added (backend scaffolding ready)

## Recently Completed

- [x] **Node.js Backend**: Created Express + MongoDB authentication backend
  - User model with bcrypt password hashing
  - JWT authentication middleware
  - OTP email verification (Nodemailer)
  - Role-based access control (admin/user)
  - Admin panel with user management
- [x] **Frontend Auth Pages**: /login, /register, /verify-otp, /admin
- [x] **Protected Dashboard**: Auth check before accessing dashboard
- [x] **Environment Config**: Added NEXT_PUBLIC_BACKEND_URL to .env.local.example

The project has been transformed from a blank Next.js template into a full FraudGuard
ML fraud detection system. The AI Assistant now integrates with OpenAI GPT for
real-time fraud analysis explanations.

## Recently Completed

- [x] **Syntax Error Fix**: Removed duplicate `.catch()` statements in dashboard health check that caused build failure
- [x] **Health Check Endpoint Fix**: Changed ML service health check from `/health` to `/` (root endpoint) because the deployed Render service returns `{"status":"Model API is running!"}` at root but 404 at `/health`. Dashboard now properly detects ML service as online.
- [x] **Direct /predict Endpoint**: Added new POST `/predict` endpoint that accepts transaction JSON directly from Next.js frontend (no auth required)
- [x] **predict_transactions Method**: Added `predict_transactions()` method to FraudDetectorService for real-time predictions
- [x] **Pushed to Git**: Committed and pushed all changes for deployment to Render

- [x] **Direct OpenAI Integration**: Added browser-based ChatGPT integration
  - Created `/api/chat` route for direct OpenAI API calls
  - Updated chatbot to accept API key in browser (stored in localStorage)
  - Added settings modal for API key management
  - Works WITHOUT Docker/Python - just needs user's OpenAI API key
  - Falls back to local responses when no API key provided
- [x] **Fixed ML API URL Display**: Updated home page to use `NEXT_PUBLIC_ML_API_URL` env var for "Local Flask Service" display (was hardcoded to localhost:5000)
- [x] **.env.local created**: Added local environment file with `NEXT_PUBLIC_ML_API_URL=https://ml-file-for-url.onrender.com`
  - Created AIExplainerService with professional fraud detection prompts
  - Added /chat endpoint for conversational AI
  - Added /explain/transaction endpoint for AI explanations
  - Updated chatbot UI to use real OpenAI API
- [x] **Environment Variable Name Fix**: Changed all references from `NEXT_PUBLIC_ML_API_URL` to `NEXT_PUBLIC_API_URL` to match the variable name set in Vercel dashboard
- [x] **Health Check Endpoint Fix**: Changed ML health check from `/health` to `/` (root endpoint) because Render service returns `{"status":"Model API is running!"}` at root but 404 at `/health`. Dashboard now properly detects ML service as online.

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

- [x] Phase 7: AI Chatbot Assistant
  - /chatbot: Conversational AI for fraud analysis
  - Contextual explanations of fraud detection results
  - Interactive Q&A about transaction risk factors
  - Transaction ID lookup integration
  - Quick action buttons for common queries

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
| `src/app/login/page.tsx` | Login page | ✅ Ready (needs backend) |
| `src/app/register/page.tsx` | Registration page | ✅ Ready (needs backend) |
| `src/app/verify-otp/page.tsx` | OTP verification | ✅ Ready (needs backend) |
| `src/app/dashboard/page.tsx` | Analytics dashboard | ✅ Live |
| `src/app/admin/page.tsx` | Admin panel | ✅ Ready (needs backend) |
| `src/app/upload/page.tsx` | CSV upload + ML results | ✅ Live |
| `src/app/explain/page.tsx` | SHAP explainability | ✅ Live |
| `src/app/api-test/page.tsx` | Flask API tester | ✅ Live |
| `src/app/chatbot/page.tsx` | AI Assistant chatbot | ✅ Live |
| `backend/` | Node.js auth backend | ✅ Scaffolding ready |

## What's Needed to Run

### Backend Setup
1. **MongoDB**: Create free account at MongoDB Atlas or use local MongoDB
2. **Deploy Backend**: Deploy `backend/` folder to Render/Railway
3. **Environment Variables** (backend):
   - `MONGODB_URI`: Your MongoDB connection string
   - `JWT_SECRET`: Random string for JWT signing
   - `EMAIL_USER`: Gmail for OTP emails
   - `EMAIL_PASS`: Gmail app password
4. **Frontend Environment Variable**:
   - `NEXT_PUBLIC_BACKEND_URL`: Your deployed backend URL

### Quick Test
To test locally:
```bash
cd backend
cp .env.example .env
# Edit .env with your MongoDB URI
npm install
npm start
```

## Flask Endpoints Expected by Frontend

| Method | Path | Called by |
|--------|------|-----------|
| GET | /health | Dashboard (status check) |
| POST | /predict | Upload page (fraud detection) |
| GET | /explain/<id> | Explain page & Chatbot (SHAP) |
| POST | /chat | AI Assistant chatbot |
| POST | /explain/transaction | AI Transaction explanation |
| GET | /chat/status | Chatbot (check AI config) |

## Session History

| Date | Changes |
|------|---------|
| Initial | Template created with base setup |
| 2026-02-26 | Full phases 3-7 scaffolding + Next.js dashboard with Flask ngrok integration |
| 2026-02-27 | Fixed hardcoded ngrok URLs - now using NEXT_PUBLIC_ML_API_URL env var |
| 2026-03-02 | Integrated OpenAI ChatGPT for AI-powered fraud explanations |
| 2026-03-05 | Fixed hardcoded localhost:5000 in API test page, added .env.local.example for Vercel config |
