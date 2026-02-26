<?php

namespace App\Http\Controllers\Api;

/**
 * PHASE 4 — Fraud Result API Controller
 * Receives ML prediction results from the Python microservice.
 * Also exposes aggregated fraud data for Vue.js dashboard components.
 *
 * Data flow:
 *   Python ML Service → POST /api/internal/ml-results → this controller
 *   Vue Dashboard     → GET  /api/fraud-results/...   → this controller
 */

use App\Http\Controllers\Controller;
use App\Models\Dataset;
use App\Models\FraudResult;
use App\Models\JobLog;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class FraudResultApiController extends Controller
{
    // ── Receive ML results from Python service ────────
    // Called by Python after processing completes
    public function receiveResults(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'dataset_id'    => ['required', 'integer', 'exists:datasets,id'],
            'job_id'        => ['required', 'string'],
            'status'        => ['required', 'in:success,failed'],
            'results'       => ['required_if:status,success', 'array'],
            'results.*.transaction_id'  => ['required', 'string'],
            'results.*.fraud_score'     => ['required', 'numeric', 'min:0', 'max:1'],
            'results.*.is_fraud'        => ['required', 'boolean'],
            'results.*.is_anomaly'      => ['required', 'boolean'],
            'results.*.vendor_id'       => ['nullable', 'string'],
            'results.*.vendor_name'     => ['nullable', 'string'],
            'results.*.region'          => ['nullable', 'string'],
            'results.*.amount'          => ['nullable', 'numeric'],
            'error_message' => ['nullable', 'string'],
        ]);

        $dataset = Dataset::findOrFail($validated['dataset_id']);

        if ($validated['status'] === 'failed') {
            // Update job log with failure
            JobLog::where('job_reference', $validated['job_id'])
                ->update([
                    'status'        => 'failed',
                    'error_message' => $validated['error_message'] ?? 'Unknown ML error',
                    'completed_at'  => now(),
                ]);

            $dataset->update(['status' => 'failed']);

            return response()->json(['message' => 'Failure recorded'], 200);
        }

        // Bulk insert fraud results
        $records = collect($validated['results'])->map(fn($r) => [
            'dataset_id'        => $dataset->id,
            'transaction_id'    => $r['transaction_id'],
            'fraud_score'       => $r['fraud_score'],
            'is_fraud'          => $r['is_fraud'],
            'is_anomaly'        => $r['is_anomaly'],
            'vendor_id'         => $r['vendor_id'] ?? null,
            'vendor_name'       => $r['vendor_name'] ?? null,
            'region'            => $r['region'] ?? null,
            'amount'            => $r['amount'] ?? null,
            'created_at'        => now(),
            'updated_at'        => now(),
        ])->toArray();

        FraudResult::insert($records);

        // Update dataset and job status
        $dataset->update([
            'status'    => 'processed',
            'row_count' => count($records),
        ]);

        JobLog::where('job_reference', $validated['job_id'])
            ->update(['status' => 'completed', 'completed_at' => now()]);

        AuditLog::record(
            'ml_results_received',
            "ML results received for dataset #{$dataset->id}: " . count($records) . " records",
            null,
            ['dataset_id' => $dataset->id, 'fraud_count' => collect($records)->where('is_fraud', true)->count()]
        );

        return response()->json(['message' => 'Results stored successfully', 'count' => count($records)], 200);
    }

    // ── Python ML service heartbeat ───────────────────
    public function heartbeat(): JsonResponse
    {
        return response()->json(['status' => 'ok', 'timestamp' => now()->toIso8601String()]);
    }

    // ── List fraud results (for Vue dashboard) ────────
    public function index(Request $request): JsonResponse
    {
        $results = FraudResult::query()
            ->when($request->dataset_id, fn($q, $id) => $q->where('dataset_id', $id))
            ->when($request->is_fraud, fn($q) => $q->where('is_fraud', true))
            ->when($request->min_score, fn($q, $s) => $q->where('fraud_score', '>=', $s))
            ->latest()
            ->paginate(50);

        return response()->json($results);
    }

    // ── Single fraud result ───────────────────────────
    public function show(FraudResult $result): JsonResponse
    {
        return response()->json($result->load('explanation'));
    }

    // ── Geo summary for fraud map (Phase 5) ───────────
    public function geoSummary(): JsonResponse
    {
        $data = FraudResult::selectRaw('
                region,
                COUNT(*) as transaction_count,
                ROUND(AVG(fraud_score), 4) as avg_score,
                SUM(CASE WHEN is_fraud = 1 THEN 1 ELSE 0 END) as fraud_count
            ')
            ->whereNotNull('region')
            ->groupBy('region')
            ->orderByDesc('avg_score')
            ->get();

        return response()->json($data);
    }

    // ── Vendor risk summary (Phase 5) ─────────────────
    public function vendorSummary(): JsonResponse
    {
        $data = FraudResult::selectRaw('
                vendor_id,
                vendor_name,
                COUNT(*) as total_transactions,
                ROUND(AVG(fraud_score), 4) as risk_score,
                SUM(CASE WHEN is_fraud = 1 THEN 1 ELSE 0 END) as fraud_count,
                ROUND(SUM(amount), 2) as total_amount
            ')
            ->whereNotNull('vendor_id')
            ->groupBy('vendor_id', 'vendor_name')
            ->orderByDesc('risk_score')
            ->limit(50)
            ->get();

        return response()->json($data);
    }

    // ── Time-series data (Phase 5) ────────────────────
    public function timeSeries(Request $request): JsonResponse
    {
        $days = $request->integer('days', 90);

        $data = FraudResult::selectRaw('
                DATE(created_at) as date,
                COUNT(*) as total,
                SUM(CASE WHEN is_fraud = 1 THEN 1 ELSE 0 END) as fraud_count,
                ROUND(AVG(fraud_score), 4) as avg_score
            ')
            ->where('created_at', '>=', now()->subDays($days))
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return response()->json($data);
    }

    // ── Anomaly list (Phase 5) ────────────────────────
    public function anomalies(): JsonResponse
    {
        $data = FraudResult::where('is_anomaly', true)
            ->latest()
            ->limit(100)
            ->get();

        return response()->json($data);
    }
}
