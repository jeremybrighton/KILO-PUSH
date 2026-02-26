<?php

/**
 * PHASE 4 — API Routes for Laravel ↔ Python ML Integration
 * These routes handle internal API calls from the Python ML service
 * and expose endpoints for the Vue.js frontend dashboard components.
 */

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\DatasetApiController;
use App\Http\Controllers\Api\FraudResultApiController;
use App\Http\Controllers\Api\ExplainabilityApiController;
use App\Http\Controllers\Api\DashboardApiController;

// ─────────────────────────────────────────────
// INTERNAL CALLBACK — Python ML Service Webhook
// Called by Python after processing is complete
// ─────────────────────────────────────────────
Route::middleware('api.secret')->prefix('internal')->group(function () {
    // Python ML service posts results back here
    Route::post('/ml-results',      [FraudResultApiController::class, 'receiveResults']);
    Route::post('/ml-explain',      [ExplainabilityApiController::class, 'receiveExplanations']);
    Route::post('/ml-heartbeat',    [FraudResultApiController::class, 'heartbeat']);
});

// ─────────────────────────────────────────────
// AUTHENTICATED API — Sanctum token auth
// Used by Vue.js dashboard components
// ─────────────────────────────────────────────
Route::middleware('auth:sanctum')->group(function () {

    // Dataset endpoints
    Route::apiResource('datasets', DatasetApiController::class);
    Route::post('datasets/{dataset}/process', [DatasetApiController::class, 'triggerProcessing']);

    // Fraud results — PHASE 5 data for dashboards
    Route::get('fraud-results',                     [FraudResultApiController::class, 'index']);
    Route::get('fraud-results/{result}',            [FraudResultApiController::class, 'show']);
    Route::get('fraud-results/summary/geo',         [FraudResultApiController::class, 'geoSummary']);
    Route::get('fraud-results/summary/vendor',      [FraudResultApiController::class, 'vendorSummary']);
    Route::get('fraud-results/summary/time-series', [FraudResultApiController::class, 'timeSeries']);
    Route::get('fraud-results/summary/anomalies',   [FraudResultApiController::class, 'anomalies']);

    // Explainability — PHASE 6 endpoints
    Route::get('explain/{transaction}',             [ExplainabilityApiController::class, 'show']);
    Route::get('explain/{transaction}/narrative',   [ExplainabilityApiController::class, 'narrative']);
    Route::get('explain/{transaction}/features',    [ExplainabilityApiController::class, 'features']);

    // Dashboard aggregates
    Route::get('dashboard/stats',   [DashboardApiController::class, 'stats']);
    Route::get('dashboard/recent',  [DashboardApiController::class, 'recentActivity']);
});
