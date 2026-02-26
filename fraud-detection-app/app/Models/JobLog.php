<?php

namespace App\Models;

/**
 * PHASE 3 — Job Log Model
 * Tracks the lifecycle of background ML processing jobs.
 * Status: pending → processing → completed | failed | retrying
 */

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class JobLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'dataset_id',
        'triggered_by',     // User ID who triggered the job
        'job_reference',    // Unique job ID for correlation with Python
        'status',           // pending | processing | completed | failed | retrying
        'retry_count',
        'error_message',
        'started_at',
        'completed_at',
    ];

    protected $casts = [
        'retry_count'  => 'integer',
        'started_at'   => 'datetime',
        'completed_at' => 'datetime',
    ];

    // ── Relationships ─────────────────────────────────
    public function dataset()
    {
        return $this->belongsTo(Dataset::class);
    }

    public function triggeredBy()
    {
        return $this->belongsTo(User::class, 'triggered_by');
    }

    // ── Helpers ───────────────────────────────────────
    public function getDurationAttribute(): ?string
    {
        if (!$this->started_at || !$this->completed_at) return null;
        $seconds = $this->started_at->diffInSeconds($this->completed_at);
        return $seconds < 60 ? "{$seconds}s" : round($seconds / 60, 1) . 'm';
    }

    public function getStatusBadgeColorAttribute(): string
    {
        return match($this->status) {
            'completed'  => 'green',
            'processing' => 'blue',
            'pending'    => 'gray',
            'retrying'   => 'yellow',
            'failed'     => 'red',
            default      => 'gray',
        };
    }
}
