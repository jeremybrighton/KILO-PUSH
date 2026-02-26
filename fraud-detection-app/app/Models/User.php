<?php

namespace App\Models;

/**
 * PHASE 3 — User Model
 * Extends Laravel's default User with role-based access control.
 * Roles: admin | analyst | vendor
 */

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',         // admin | analyst | vendor
        'is_active',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password'          => 'hashed',
        'is_active'         => 'boolean',
    ];

    // ── Role helpers ──────────────────────────────────
    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    public function isAnalyst(): bool
    {
        return $this->role === 'analyst';
    }

    public function isVendor(): bool
    {
        return $this->role === 'vendor';
    }

    public function hasRole(string ...$roles): bool
    {
        return in_array($this->role, $roles);
    }

    // ── Relationships ─────────────────────────────────
    public function datasets()
    {
        return $this->hasMany(Dataset::class, 'uploaded_by');
    }

    public function auditLogs()
    {
        return $this->hasMany(AuditLog::class);
    }
}
