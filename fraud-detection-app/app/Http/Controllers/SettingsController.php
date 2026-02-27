<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class SettingsController extends Controller
{
    /**
     * Display the settings overview page.
     */
    public function index()
    {
        $user = Auth::user();
        
        // Get current settings from config or database
        $thresholds = [
            'high_risk' => config('fraud.thresholds.high_risk', 80),
            'medium_risk' => config('fraud.thresholds.medium_risk', 50),
            'low_risk' => config('fraud.thresholds.low_risk', 20),
        ];

        $alerts = [
            'email_enabled' => config('fraud.alerts.email_enabled', true),
            'slack_enabled' => config('fraud.alerts.slack_enabled', false),
            'daily_report' => config('fraud.alerts.daily_report', true),
            'realtime_alerts' => config('fraud.alerts.realtime', true),
        ];

        $vendorRules = [
            'blacklist' => config('fraud.vendor.blacklist', []),
            'geo_restrictions' => config('fraud.vendor.geo_restrictions', false),
            'max_daily_limit' => config('fraud.vendor.max_daily_limit', 10000),
            'frequency_sensitivity' => config('fraud.vendor.frequency_sensitivity', 'medium'),
        ];

        $modelInfo = [
            'version' => config('fraud.model.version', '2.1.0'),
            'last_trained' => config('fraud.model.last_trained', '2026-02-15'),
            'accuracy' => config('fraud.model.accuracy', '94.2%'),
            'confidence_threshold' => config('fraud.model.confidence_threshold', 0.75),
        ];

        $apiConfig = [
            'endpoint' => config('services.ml_api.endpoint', 'http://localhost:5000'),
            'timeout' => config('services.ml_api.timeout', 30),
            'retries' => config('services.ml_api.retries', 3),
        ];

        $recentAuditLogs = AuditLog::latest()->limit(20)->get();

        return view('settings.index', compact(
            'user', 
            'thresholds', 
            'alerts', 
            'vendorRules', 
            'modelInfo', 
            'apiConfig',
            'recentAuditLogs'
        ));
    }

    /**
     * Update risk threshold configuration.
     */
    public function updateThresholds(Request $request)
    {
        // Only admins can change thresholds
        if (Auth::user()->role !== 'admin') {
            return back()->with('error', 'Only administrators can modify risk thresholds.');
        }

        $validated = $request->validate([
            'high_risk' => 'required|integer|min:50|max:100',
            'medium_risk' => 'required|integer|min:30|max:90',
            'low_risk' => 'required|integer|min:10|max:70',
        ]);

        // Validate that thresholds are in descending order
        if ($validated['high_risk'] <= $validated['medium_risk'] ||
            $validated['medium_risk'] <= $validated['low_risk']) {
            return back()->with('error', 'Thresholds must be in descending order: High > Medium > Low');
        }

        // Update config (in production, store in database)
        config(['fraud.thresholds.high_risk' => $validated['high_risk']]);
        config(['fraud.thresholds.medium_risk' => $validated['medium_risk']]);
        config(['fraud.thresholds.low_risk' => $validated['low_risk']]);

        // Log the change
        AuditLog::create([
            'user_id' => Auth::id(),
            'action' => 'threshold_update',
            'entity_type' => 'settings',
            'entity_id' => 'risk_thresholds',
            'old_value' => json_encode(['high' => config('fraud.thresholds.high_risk'), 'medium' => config('fraud.thresholds.medium_risk'), 'low' => config('fraud.thresholds.low_risk')]),
            'new_value' => json_encode($validated),
            'ip_address' => $request->ip(),
        ]);

        return back()->with('success', 'Risk thresholds updated successfully.');
    }

    /**
     * Update alert and notification settings.
     */
    public function updateAlerts(Request $request)
    {
        if (Auth::user()->role !== 'admin') {
            return back()->with('error', 'Only administrators can modify alert settings.');
        }

        $validated = $request->validate([
            'email_enabled' => 'boolean',
            'slack_enabled' => 'boolean',
            'daily_report' => 'boolean',
            'realtime_alerts' => 'boolean',
            'slack_webhook' => 'nullable|url',
            'alert_email' => 'nullable|email',
        ]);

        config(['fraud.alerts.email_enabled' => $validated['email_enabled'] ?? false]);
        config(['fraud.alerts.slack_enabled' => $validated['slack_enabled'] ?? false]);
        config(['fraud.alerts.daily_report' => $validated['daily_report'] ?? false]);
        config(['fraud.alerts.realtime' => $validated['realtime_alerts'] ?? false]);

        if (isset($validated['slack_webhook'])) {
            config(['fraud.alerts.slack_webhook' => $validated['slack_webhook']]);
        }

        if (isset($validated['alert_email'])) {
            config(['fraud.alerts.alert_email' => $validated['alert_email']]);
        }

        AuditLog::create([
            'user_id' => Auth::id(),
            'action' => 'alert_settings_update',
            'entity_type' => 'settings',
            'entity_id' => 'alert_config',
            'old_value' => '',
            'new_value' => json_encode($validated),
            'ip_address' => $request->ip(),
        ]);

        return back()->with('success', 'Alert settings updated successfully.');
    }

    /**
     * Update vendor monitoring rules.
     */
    public function updateVendorRules(Request $request)
    {
        if (Auth::user()->role !== 'admin') {
            return back()->with('error', 'Only administrators can modify vendor rules.');
        }

        $validated = $request->validate([
            'geo_restrictions' => 'boolean',
            'max_daily_limit' => 'required|integer|min:1000',
            'frequency_sensitivity' => ['required', Rule::in(['low', 'medium', 'high'])],
            'blacklist' => 'nullable|array',
            'blacklist.*' => 'string',
        ]);

        config(['fraud.vendor.geo_restrictions' => $validated['geo_restrictions'] ?? false]);
        config(['fraud.vendor.max_daily_limit' => $validated['max_daily_limit']]);
        config(['fraud.vendor.frequency_sensitivity' => $validated['frequency_sensitivity']]);
        config(['fraud.vendor.blacklist' => $validated['blacklist'] ?? []]);

        AuditLog::create([
            'user_id' => Auth::id(),
            'action' => 'vendor_rules_update',
            'entity_type' => 'settings',
            'entity_id' => 'vendor_rules',
            'old_value' => '',
            'new_value' => json_encode($validated),
            'ip_address' => $request->ip(),
        ]);

        return back()->with('success', 'Vendor monitoring rules updated successfully.');
    }

    /**
     * Update API configuration.
     */
    public function updateApiConfig(Request $request)
    {
        if (Auth::user()->role !== 'admin') {
            return back()->with('error', 'Only administrators can modify API settings.');
        }

        $validated = $request->validate([
            'endpoint' => 'required|url',
            'timeout' => 'required|integer|min:5|max:120',
            'retries' => 'required|integer|min:0|max:10',
            'api_secret' => 'nullable|string|min:16',
        ]);

        config(['services.ml_api.endpoint' => $validated['endpoint']]);
        config(['services.ml_api.timeout' => $validated['timeout']]);
        config(['services.ml_api.retries' => $validated['retries']]);

        if (!empty($validated['api_secret'])) {
            config(['services.ml_api.secret' => $validated['api_secret']]);
        }

        AuditLog::create([
            'user_id' => Auth::id(),
            'action' => 'api_config_update',
            'entity_type' => 'settings',
            'entity_id' => 'api_config',
            'old_value' => '',
            'new_value' => json_encode(['endpoint' => $validated['endpoint'], 'timeout' => $validated['timeout'], 'retries' => $validated['retries']]),
            'ip_address' => $request->ip(),
        ]);

        return back()->with('success', 'API configuration updated successfully.');
    }

    /**
     * Display user management.
     */
    public function users(Request $request)
    {
        $users = User::query()
            ->when($request->search, function ($query) use ($request) {
                $query->where('name', 'like', "%{$request->search}%")
                    ->orWhere('email', 'like', "%{$request->search}%");
            })
            ->when($request->role, function ($query) use ($request) {
                $query->where('role', $request->role);
            })
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        return view('settings.users', compact('users'));
    }

    /**
     * Update user role.
     */
    public function updateUserRole(Request $request, User $user)
    {
        if (Auth::user()->role !== 'admin') {
            return back()->with('error', 'Only administrators can modify user roles.');
        }

        // Prevent modifying own role
        if ($user->id === Auth::id()) {
            return back()->with('error', 'You cannot modify your own role.');
        }

        $validated = $request->validate([
            'role' => ['required', Rule::in(['admin', 'analyst', 'auditor', 'viewer'])],
        ]);

        $oldRole = $user->role;
        $user->update(['role' => $validated['role']]);

        AuditLog::create([
            'user_id' => Auth::id(),
            'action' => 'role_change',
            'entity_type' => 'user',
            'entity_id' => $user->id,
            'old_value' => $oldRole,
            'new_value' => $validated['role'],
            'ip_address' => $request->ip(),
        ]);

        return back()->with('success', "User role updated to {$validated['role']}.");
    }

    /**
     * Display audit logs.
     */
    public function auditLogs(Request $request)
    {
        $logs = AuditLog::query()
            ->with('user')
            ->when($request->action, function ($query) use ($request) {
                $query->where('action', 'like', "%{$request->action}%");
            })
            ->when($request->user_id, function ($query) use ($request) {
                $query->where('user_id', $request->user_id);
            })
            ->orderBy('created_at', 'desc')
            ->paginate(30);

        return view('settings.audit-logs', compact('logs'));
    }

    /**
     * Display profile settings.
     */
    public function profile()
    {
        return view('settings.profile');
    }

    /**
     * Update profile settings.
     */
    public function updateProfile(Request $request)
    {
        $user = Auth::user();

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => ['required', 'email', Rule::unique('users')->ignore($user->id)],
        ]);

        $user->update($validated);

        AuditLog::create([
            'user_id' => $user->id,
            'action' => 'profile_update',
            'entity_type' => 'user',
            'entity_id' => $user->id,
            'old_value' => '',
            'new_value' => json_encode(['name' => $validated['name'], 'email' => $validated['email']]),
            'ip_address' => $request->ip(),
        ]);

        return back()->with('success', 'Profile updated successfully.');
    }

    /**
     * Update password.
     */
    public function updatePassword(Request $request)
    {
        $validated = $request->validate([
            'current_password' => 'required|string',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user = Auth::user();

        if (!Hash::check($validated['current_password'], $user->password)) {
            return back()->with('error', 'Current password is incorrect.');
        }

        $user->update([
            'password' => Hash::make($validated['password']),
        ]);

        AuditLog::create([
            'user_id' => $user->id,
            'action' => 'password_change',
            'entity_type' => 'user',
            'entity_id' => $user->id,
            'old_value' => '',
            'new_value' => json_encode(['changed' => true]),
            'ip_address' => $request->ip(),
        ]);

        return back()->with('success', 'Password updated successfully.');
    }

    /**
     * Test ML API connection.
     */
    public function testApiConnection()
    {
        try {
            $endpoint = config('services.ml_api.endpoint');
            $client = new \GuzzleHttp\Client([
                'timeout' => config('services.ml_api.timeout', 30),
            ]);

            $response = $client->get("{$endpoint}/health", [
                'headers' => [
                    'X-API-Secret' => config('services.ml_api.secret'),
                    'Accept' => 'application/json',
                ],
            ]);

            $status = json_decode($response->getBody(), true);

            return response()->json([
                'success' => true,
                'message' => 'ML API is reachable',
                'status' => $status,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to connect to ML API: ' . $e->getMessage(),
            ], 500);
        }
    }
}
