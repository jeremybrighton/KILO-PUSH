<?php

namespace App\Models;

/**
 * PHASE 4/5 — Fraud Result Model
 * Stores ML prediction results received from the Python microservice.
 * Each record represents one transaction's fraud assessment.
 */

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FraudResult extends Model
{
    use HasFactory;

    protected $fillable = [
        'dataset_id',
        'transaction_id',
        'fraud_score',      // 0.0 to 1.0 — higher = more suspicious
        'is_fraud',         // Boolean flag from ML model
        'is_anomaly',       // Anomaly detection flag
        'vendor_id',
        'vendor_name',
        'region',
        'amount',
    ];

    protected $casts = [
        'fraud_score' => 'float',
        'is_fraud'    => 'boolean',
        'is_anomaly'  => 'boolean',
        'amount'      => 'float',
    ];

    // ── Relationships ─────────────────────────────────
    public function dataset()
    {
        return $this->belongsTo(Dataset::class);
    }

    public function explanation()
    {
        return $this->hasOne(FraudExplanation::class, 'transaction_id', 'transaction_id');
    }

    // ── Scopes ────────────────────────────────────────
    public function scopeFlaggedToday($query)
    {
        return $query->where('is_fraud', true)->whereDate('created_at', today());
    }

    public function scopeHighRiskVendors($query)
    {
        return $query->where('is_fraud', true)
            ->distinct('vendor_id')
            ->whereNotNull('vendor_id');
    }

    public function scopeHighRisk($query, float $threshold = 0.7)
    {
        return $query->where('fraud_score', '>=', $threshold);
    }

    // ── Helpers ───────────────────────────────────────
    public function getRiskLevelAttribute(): string
    {
        return match(true) {
            $this->fraud_score >= 0.8 => 'critical',
            $this->fraud_score >= 0.6 => 'high',
            $this->fraud_score >= 0.4 => 'medium',
            default                   => 'low',
        };
    }

    public function getRiskColorAttribute(): string
    {
        return match($this->risk_level) {
            'critical' => 'red',
            'high'     => 'orange',
            'medium'   => 'yellow',
            default    => 'green',
        };
    }
}
