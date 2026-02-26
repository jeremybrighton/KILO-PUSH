<?php

namespace App\Http\Controllers;

/**
 * PHASE 3/5/6 — Dashboard Controller
 * Serves the main dashboard and all analytics/explainability views.
 * Phase 3: Basic stats and recent activity
 * Phase 5: Geo maps, vendor risk, time-series charts
 * Phase 6: Transaction-level explainability
 */

use App\Models\Dataset;
use App\Models\FraudResult;
use App\Models\Transaction;
use App\Models\JobLog;
use App\Services\ExplainabilityService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class DashboardController extends Controller
{
    public function __construct(
        private ExplainabilityService $explainabilityService
    ) {}

    // ── Main dashboard — role-aware ───────────────────
    public function index()
    {
        $user = Auth::user();

        // Stats visible to all roles (scoped by role)
        $stats = [
            'total_datasets'    => Dataset::visibleTo($user)->count(),
            'pending_jobs'      => JobLog::where('status', 'pending')->count(),
            'flagged_today'     => FraudResult::flaggedToday()->count(),
            'high_risk_vendors' => FraudResult::highRiskVendors()->count(),
        ];

        $recentDatasets = Dataset::visibleTo($user)->latest()->take(5)->get();
        $recentJobs     = JobLog::latest()->take(5)->get();

        return view('dashboard.index', compact('stats', 'recentDatasets', 'recentJobs'));
    }

    // ── PHASE 5: Geo-based fraud risk map ─────────────
    public function fraudMap()
    {
        // Aggregated fraud scores by geographic region
        // Placeholder data structure — populated by ML results in Phase 4
        $geoData = FraudResult::selectRaw('
                region,
                COUNT(*) as transaction_count,
                AVG(fraud_score) as avg_score,
                SUM(CASE WHEN is_fraud = 1 THEN 1 ELSE 0 END) as fraud_count
            ')
            ->groupBy('region')
            ->get();

        return view('dashboard.fraud-map', compact('geoData'));
    }

    // ── PHASE 5: Vendor risk ranking table ────────────
    public function vendorRisk()
    {
        $vendors = FraudResult::selectRaw('
                vendor_id,
                vendor_name,
                COUNT(*) as total_transactions,
                AVG(fraud_score) as risk_score,
                SUM(CASE WHEN is_fraud = 1 THEN 1 ELSE 0 END) as fraud_count
            ')
            ->groupBy('vendor_id', 'vendor_name')
            ->orderByDesc('risk_score')
            ->paginate(20);

        return view('dashboard.vendor-risk', compact('vendors'));
    }

    // ── PHASE 5: Time-series anomaly graph ────────────
    public function timeSeries()
    {
        // Daily fraud counts for the last 90 days
        $timeSeries = FraudResult::selectRaw('
                DATE(created_at) as date,
                COUNT(*) as total,
                SUM(CASE WHEN is_fraud = 1 THEN 1 ELSE 0 END) as fraud_count,
                AVG(fraud_score) as avg_score
            ')
            ->where('created_at', '>=', now()->subDays(90))
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return view('dashboard.time-series', compact('timeSeries'));
    }

    // ── PHASE 5: Anomaly detection overview ───────────
    public function anomalies()
    {
        $anomalies = FraudResult::where('is_anomaly', true)
            ->with(['transaction', 'dataset'])
            ->latest()
            ->paginate(25);

        return view('dashboard.anomalies', compact('anomalies'));
    }

    // ── PHASE 6: Transaction-level explainability ─────
    public function explain(Transaction $transaction)
    {
        // Fetch SHAP-based explanation from Python ML service
        // Falls back to cached explanation if available
        $explanation = $this->explainabilityService->getExplanation($transaction);

        return view('explainability.explain', compact('transaction', 'explanation'));
    }

    // ── PHASE 6: Downloadable reports ─────────────────
    public function reports()
    {
        $reports = FraudResult::with(['transaction', 'explanation'])
            ->where('is_fraud', true)
            ->latest()
            ->paginate(25);

        return view('explainability.reports', compact('reports'));
    }
}
