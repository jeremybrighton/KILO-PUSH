<?php

namespace App\Models;

/**
 * PHASE 6 — Fraud Explanation Model
 * Stores SHAP-based feature importance and human-readable narratives
 * for each flagged transaction. Populated by Python ML service.
 */

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FraudExplanation extends Model
{
    use HasFactory;

    protected $fillable = [
        'transaction_id',
        'dataset_id',
        'top_features',     // JSON: [{name, value, impact}, ...]
        'shap_values',      // JSON: full SHAP value array
        'base_value',       // SHAP base/expected value
        'narrative',        // Human-readable explanation string
    ];

    protected $casts = [
        'top_features' => 'array',
        'shap_values'  => 'array',
        'base_value'   => 'float',
    ];

    // ── Relationships ─────────────────────────────────
    public function dataset()
    {
        return $this->belongsTo(Dataset::class);
    }

    public function fraudResult()
    {
        return $this->belongsTo(FraudResult::class, 'transaction_id', 'transaction_id');
    }

    // ── Helpers ───────────────────────────────────────

    // Returns top N features sorted by absolute SHAP impact
    public function getTopNFeatures(int $n = 5): array
    {
        $features = $this->top_features ?? [];
        usort($features, fn($a, $b) => abs($b['impact']) <=> abs($a['impact']));
        return array_slice($features, 0, $n);
    }

    // Returns features that increase fraud risk (positive SHAP impact)
    public function getRiskIncreasingFeatures(): array
    {
        return array_filter($this->top_features ?? [], fn($f) => $f['impact'] > 0);
    }

    // Returns features that decrease fraud risk (negative SHAP impact)
    public function getRiskDecreasingFeatures(): array
    {
        return array_filter($this->top_features ?? [], fn($f) => $f['impact'] < 0);
    }
}
