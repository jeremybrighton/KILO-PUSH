<?php

namespace App\Http\Controllers\Api;

/**
 * PHASE 6 — Explainability API Controller
 * Receives SHAP-based feature importance from Python ML service.
 * Exposes human-readable explanations for flagged transactions.
 *
 * Data flow:
 *   Python ML Service → POST /api/internal/ml-explain → this controller
 *   Vue Dashboard     → GET  /api/explain/{transaction} → this controller
 */

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use App\Models\FraudExplanation;
use App\Services\ExplainabilityService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ExplainabilityApiController extends Controller
{
    public function __construct(
        private ExplainabilityService $explainabilityService
    ) {}

    // ── Receive SHAP explanations from Python ─────────
    public function receiveExplanations(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'dataset_id'                        => ['required', 'integer', 'exists:datasets,id'],
            'explanations'                      => ['required', 'array'],
            'explanations.*.transaction_id'     => ['required', 'string'],
            'explanations.*.top_features'       => ['required', 'array'],
            'explanations.*.top_features.*.name'    => ['required', 'string'],
            'explanations.*.top_features.*.value'   => ['required', 'numeric'],
            'explanations.*.top_features.*.impact'  => ['required', 'numeric'],
            'explanations.*.shap_values'        => ['nullable', 'array'],
            'explanations.*.base_value'         => ['nullable', 'numeric'],
        ]);

        $stored = 0;
        foreach ($validated['explanations'] as $exp) {
            // Generate human-readable narrative from feature importance
            $narrative = $this->explainabilityService->generateNarrative($exp['top_features']);

            FraudExplanation::updateOrCreate(
                ['transaction_id' => $exp['transaction_id']],
                [
                    'dataset_id'    => $validated['dataset_id'],
                    'top_features'  => json_encode($exp['top_features']),
                    'shap_values'   => isset($exp['shap_values']) ? json_encode($exp['shap_values']) : null,
                    'base_value'    => $exp['base_value'] ?? null,
                    'narrative'     => $narrative,
                ]
            );
            $stored++;
        }

        return response()->json([
            'message' => 'Explanations stored successfully',
            'count'   => $stored,
        ], 200);
    }

    // ── Get explanation for a transaction ─────────────
    public function show(Transaction $transaction): JsonResponse
    {
        $explanation = FraudExplanation::where('transaction_id', $transaction->transaction_id)
            ->firstOrFail();

        return response()->json([
            'transaction_id'    => $transaction->transaction_id,
            'fraud_score'       => $transaction->fraudResult?->fraud_score,
            'is_fraud'          => $transaction->fraudResult?->is_fraud,
            'top_features'      => json_decode($explanation->top_features, true),
            'narrative'         => $explanation->narrative,
            'base_value'        => $explanation->base_value,
        ]);
    }

    // ── Get human-readable narrative only ─────────────
    public function narrative(Transaction $transaction): JsonResponse
    {
        $explanation = FraudExplanation::where('transaction_id', $transaction->transaction_id)
            ->firstOrFail();

        return response()->json([
            'transaction_id' => $transaction->transaction_id,
            'narrative'      => $explanation->narrative,
        ]);
    }

    // ── Get feature importance breakdown ──────────────
    public function features(Transaction $transaction): JsonResponse
    {
        $explanation = FraudExplanation::where('transaction_id', $transaction->transaction_id)
            ->firstOrFail();

        $features = json_decode($explanation->top_features, true);

        // Sort by absolute impact descending
        usort($features, fn($a, $b) => abs($b['impact']) <=> abs($a['impact']));

        return response()->json([
            'transaction_id' => $transaction->transaction_id,
            'features'       => $features,
            'base_value'     => $explanation->base_value,
        ]);
    }
}
