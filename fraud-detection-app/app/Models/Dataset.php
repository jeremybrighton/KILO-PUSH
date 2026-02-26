<?php

namespace App\Models;

/**
 * PHASE 3 — Dataset Model
 * Represents an uploaded CSV dataset.
 * Tracks file metadata, processing status, and relationships to ML results.
 * Status lifecycle: pending → processing → processed | failed
 */

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Dataset extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'filename',
        'path',
        'size_bytes',
        'row_count',
        'label',
        'description',
        'status',       // pending | processing | processed | failed
        'uploaded_by',
    ];

    protected $casts = [
        'size_bytes' => 'integer',
        'row_count'  => 'integer',
    ];

    // ── Relationships ─────────────────────────────────
    public function uploader()
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    public function fraudResults()
    {
        return $this->hasMany(FraudResult::class);
    }

    public function jobLogs()
    {
        return $this->hasMany(JobLog::class);
    }

    // ── Scopes ────────────────────────────────────────

    // Scope datasets visible to a given user based on their role
    public function scopeVisibleTo($query, User $user)
    {
        if ($user->isAdmin() || $user->isAnalyst()) {
            return $query; // See all
        }
        return $query->where('uploaded_by', $user->id);
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeProcessed($query)
    {
        return $query->where('status', 'processed');
    }

    // ── Helpers ───────────────────────────────────────
    public function getSizeFormattedAttribute(): string
    {
        $bytes = $this->size_bytes;
        if ($bytes >= 1048576) return round($bytes / 1048576, 2) . ' MB';
        if ($bytes >= 1024)    return round($bytes / 1024, 2) . ' KB';
        return $bytes . ' B';
    }

    public function isProcessed(): bool
    {
        return $this->status === 'processed';
    }
}
