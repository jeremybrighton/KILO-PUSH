<?php

namespace App\Services;

/**
 * PHASE 6 — Explainability Service
 * Generates human-readable narratives from SHAP feature importance data.
 * Translates ML feature names and values into plain English explanations.
 *
 * Example output:
 * "This transaction was flagged as high risk primarily because:
 *  the transaction amount (£4,200) is unusually high for this vendor,
 *  the vendor location changed recently, and
 *  3 transactions occurred within 10 minutes."
 */

use App\Models\Transaction;
use App\Models\FraudExplanation;

class ExplainabilityService
{
    // Human-readable labels for ML feature names
    private array $featureLabels = [
        'transaction_amount'        => 'transaction amount',
        'vendor_age_days'           => 'vendor account age',
        'location_change'           => 'vendor location change',
        'transaction_frequency'     => 'transaction frequency',
        'time_since_last_tx'        => 'time since last transaction',
        'amount_deviation'          => 'amount deviation from average',
        'new_vendor_flag'           => 'new vendor flag',
        'cross_border_flag'         => 'cross-border transaction',
        'weekend_flag'              => 'weekend transaction',
        'hour_of_day'               => 'time of day',
        'category_mismatch'         => 'category mismatch',
        'ip_risk_score'             => 'IP address risk score',
        'device_fingerprint_change' => 'device change',
    ];

    // ── Get explanation for a transaction ─────────────
    public function getExplanation(Transaction $transaction): ?array
    {
        $explanation = FraudExplanation::where('transaction_id', $transaction->transaction_id)
            ->first();

        if (!$explanation) {
            return null;
        }

        return [
            'narrative'              => $explanation->narrative,
            'top_features'           => $explanation->getTopNFeatures(5),
            'risk_increasing'        => $explanation->getRiskIncreasingFeatures(),
            'risk_decreasing'        => $explanation->getRiskDecreasingFeatures(),
            'base_value'             => $explanation->base_value,
            'has_full_shap'          => !empty($explanation->shap_values),
        ];
    }

    // ── Generate narrative from feature importance ────
    // Called when Python posts SHAP results back to Laravel
    public function generateNarrative(array $topFeatures): string
    {
        if (empty($topFeatures)) {
            return 'This transaction was flagged by the fraud detection model. Detailed feature analysis is unavailable.';
        }

        // Sort by absolute impact
        usort($topFeatures, fn($a, $b) => abs($b['impact']) <=> abs($a['impact']));

        $riskFactors    = [];
        $safetyFactors  = [];

        foreach (array_slice($topFeatures, 0, 5) as $feature) {
            $label = $this->featureLabels[$feature['name']] ?? str_replace('_', ' ', $feature['name']);
            $impact = $feature['impact'];

            if ($impact > 0.05) {
                $riskFactors[] = $this->describeRiskFactor($feature['name'], $feature['value'], $label);
            } elseif ($impact < -0.05) {
                $safetyFactors[] = $this->describeSafetyFactor($feature['name'], $feature['value'], $label);
            }
        }

        $narrative = 'This transaction was flagged as potentially fraudulent';

        if (!empty($riskFactors)) {
            $narrative .= ' primarily because: ' . implode('; ', $riskFactors) . '.';
        } else {
            $narrative .= ' based on a combination of risk indicators.';
        }

        if (!empty($safetyFactors)) {
            $narrative .= ' Mitigating factors include: ' . implode('; ', $safetyFactors) . '.';
        }

        return $narrative;
    }

    // ── Describe a risk-increasing factor ────────────
    private function describeRiskFactor(string $name, mixed $value, string $label): string
    {
        return match($name) {
            'transaction_amount'    => "the {$label} (£" . number_format($value, 2) . ") is unusually high",
            'location_change'       => "the vendor location changed recently",
            'transaction_frequency' => "high transaction frequency ({$value} transactions in a short period)",
            'new_vendor_flag'       => "this is a newly registered vendor",
            'cross_border_flag'     => "this is a cross-border transaction",
            'amount_deviation'      => "the amount deviates significantly from this vendor's average",
            'ip_risk_score'         => "the IP address has a high risk score ({$value})",
            'device_fingerprint_change' => "the device used for this transaction changed",
            'category_mismatch'     => "the transaction category does not match the vendor's typical activity",
            default                 => "elevated {$label} (value: {$value})",
        };
    }

    // ── Describe a risk-decreasing factor ────────────
    private function describeSafetyFactor(string $name, mixed $value, string $label): string
    {
        return match($name) {
            'vendor_age_days'       => "established vendor (active for {$value} days)",
            'transaction_frequency' => "normal transaction frequency",
            'transaction_amount'    => "transaction amount is within normal range",
            default                 => "normal {$label}",
        };
    }
}
