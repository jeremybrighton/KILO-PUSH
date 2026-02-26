<?php

namespace App\Models;

/**
 * PHASE 3 — Audit Log Model
 * Immutable record of all significant system events.
 * Used for compliance, debugging, and security monitoring.
 */

use Illuminate\Database\Eloquent\Model;

class AuditLog extends Model
{
    // Audit logs are never updated or deleted
    public $timestamps = false;

    protected $fillable = [
        'action',       // e.g. login, dataset_upload, role_change
        'description',
        'user_id',
        'context',      // JSON: additional metadata
        'ip_address',
        'user_agent',
        'created_at',
    ];

    protected $casts = [
        'context'    => 'array',
        'created_at' => 'datetime',
    ];

    // ── Relationships ─────────────────────────────────
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // ── Static helper for easy logging ───────────────
    public static function record(
        string $action,
        string $description,
        ?int $userId = null,
        array $context = []
    ): self {
        return static::create([
            'action'      => $action,
            'description' => $description,
            'user_id'     => $userId,
            'context'     => $context,
            'ip_address'  => request()->ip(),
            'user_agent'  => request()->userAgent(),
            'created_at'  => now(),
        ]);
    }
}
