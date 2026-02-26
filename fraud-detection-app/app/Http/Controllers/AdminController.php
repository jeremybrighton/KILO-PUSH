<?php

namespace App\Http\Controllers;

/**
 * PHASE 3 — Admin Controller
 * Provides admin-only functionality: user management, role assignment,
 * system log viewing. Restricted by RoleMiddleware to 'admin' role only.
 */

use App\Models\User;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AdminController extends Controller
{
    public function __construct()
    {
        $this->middleware('role:admin');
    }

    // ── Admin overview dashboard ──────────────────────
    public function index()
    {
        $stats = [
            'total_users'    => User::count(),
            'admins'         => User::where('role', 'admin')->count(),
            'analysts'       => User::where('role', 'analyst')->count(),
            'vendors'        => User::where('role', 'vendor')->count(),
            'recent_logins'  => AuditLog::where('action', 'login')->latest()->take(10)->get(),
        ];

        return view('admin.index', compact('stats'));
    }

    // ── List all users ────────────────────────────────
    public function users(Request $request)
    {
        $users = User::query()
            ->when($request->role, fn($q, $r) => $q->where('role', $r))
            ->when($request->search, fn($q, $s) => $q->where('name', 'like', "%{$s}%")
                ->orWhere('email', 'like', "%{$s}%"))
            ->latest()
            ->paginate(25);

        return view('admin.users', compact('users'));
    }

    // ── Update user role ──────────────────────────────
    public function updateRole(Request $request, User $user)
    {
        $request->validate([
            'role' => ['required', 'in:admin,analyst,vendor'],
        ]);

        // Prevent self-demotion
        if ($user->id === Auth::id() && $request->role !== 'admin') {
            return back()->with('error', 'You cannot change your own admin role.');
        }

        $oldRole = $user->role;
        $user->update(['role' => $request->role]);

        AuditLog::record(
            'role_change',
            "User {$user->email} role changed from {$oldRole} to {$request->role}",
            Auth::id(),
            ['target_user_id' => $user->id]
        );

        return back()->with('success', "Role updated to {$request->role} for {$user->name}.");
    }

    // ── Delete a user ─────────────────────────────────
    public function destroyUser(User $user)
    {
        if ($user->id === Auth::id()) {
            return back()->with('error', 'You cannot delete your own account.');
        }

        AuditLog::record(
            'user_delete',
            "User {$user->email} deleted",
            Auth::id(),
            ['deleted_user_id' => $user->id]
        );

        $user->delete();

        return back()->with('success', "User {$user->name} has been deleted.");
    }

    // ── View system audit logs ────────────────────────
    public function systemLogs(Request $request)
    {
        $logs = AuditLog::with('user')
            ->when($request->action, fn($q, $a) => $q->where('action', $a))
            ->when($request->user_id, fn($q, $id) => $q->where('user_id', $id))
            ->latest()
            ->paginate(50);

        $actions = AuditLog::distinct()->pluck('action');

        return view('admin.system-logs', compact('logs', 'actions'));
    }
}
