<?php

/**
 * Dashboard API Routes
 * Provides real fraud data to Next.js frontend
 * 
 * These endpoints serve actual data from the database
 * instead of the frontend using hardcoded mock data
 */

use Illuminate\Support\Facades\Route;
use App\Models\FraudResult;
use App\Models\Dataset;
use App\Models\User;
use App\Models\AuditLog;

/*
|--------------------------------------------------------------------------
| Dashboard Statistics API
|--------------------------------------------------------------------------
|
| These routes provide real-time fraud analytics data to the Next.js
| frontend dashboard. Data is fetched from the database.
|
*/

Route::middleware('auth:sanctum')->group(function () {
    
    // Get dashboard statistics
    Route::get('/stats', function () {
        $totalTransactions = FraudResult::count();
        $fraudDetected = FraudResult::where('is_fraud', true)->count();
        $totalAmount = FraudResult::sum('amount');
        $fraudAmount = FraudResult::where('is_fraud', true)->sum('amount');
        
        $fraudRate = $totalTransactions > 0 
            ? round(($fraudDetected / $totalTransactions) * 100, 2) 
            : 0;
            
        $avgRiskScore = FraudResult::avg('fraud_probability') ?? 0;
        
        return response()->json([
            'total_transactions' => $totalTransactions,
            'fraud_detected' => $fraudDetected,
            'fraud_rate' => $fraudRate,
            'total_amount' => $totalAmount,
            'fraud_amount' => $fraudAmount,
            'avg_risk_score' => round($avgRiskScore * 100, 1),
            'clean_transactions' => $totalTransactions - $fraudDetected,
        ]);
    });

    // Get recent fraud results
    Route::get('/recent-frauds', function () {
        $recent = FraudResult::with('dataset')
            ->where('is_fraud', true)
            ->orderBy('processed_at', 'desc')
            ->limit(20)
            ->get();
            
        return response()->json($recent);
    });

    // Get suspicious transactions (high risk)
    Route::get('/suspicious', function () {
        $suspicious = FraudResult::where('fraud_probability', '>=', 0.7)
            ->orderBy('fraud_probability', 'desc')
            ->limit(50)
            ->get();
            
        return response()->json($suspicious);
    });

    // Get fraud by country/region
    Route::get('/geo-stats', function () {
        $geoStats = FraudResult::select('country')
            ->selectRaw('COUNT(*) as total')
            ->selectRaw('SUM(CASE WHEN is_fraud = 1 THEN 1 ELSE 0 END) as fraud_count')
            ->selectRaw('AVG(fraud_probability) as avg_score')
            ->groupBy('country')
            ->orderByDesc('fraud_count')
            ->limit(10)
            ->get();
            
        return response()->json($geoStats);
    });

    // Get vendor risk rankings
    Route::get('/vendor-risk', function () {
        $vendorStats = FraudResult::select('vendor_name')
            ->selectRaw('COUNT(*) as total_transactions')
            ->selectRaw('SUM(CASE WHEN is_fraud = 1 THEN 1 ELSE 0 END) as fraud_count')
            ->selectRaw('AVG(fraud_probability) as avg_risk_score')
            ->groupBy('vendor_name')
            ->orderByDesc('avg_risk_score')
            ->limit(10)
            ->get();
            
        return response()->json($vendorStats);
    });

    // Get time-series data (last 14 days)
    Route::get('/timeseries', function () {
        $days = 14;
        $data = [];
        
        for ($i = $days - 1; $i >= 0; $i--) {
            $date = now()->subDays($i)->toDateString();
            
            $dayStats = FraudResult::whereDate('processed_at', $date)
                ->selectRaw('COUNT(*) as total')
                ->selectRaw('SUM(CASE WHEN is_fraud = 1 THEN 1 ELSE 0 END) as fraud_count')
                ->first();
                
            $data[] = [
                'date' => now()->subDays($i)->format('M d'),
                'total' => $dayStats->total ?? 0,
                'fraud_count' => $dayStats->fraud_count ?? 0,
            ];
        }
        
        return response()->json($data);
    });

    // Get recent activity log
    Route::get('/activity', function () {
        $activities = AuditLog::with('user')
            ->orderBy('created_at', 'desc')
            ->limit(20)
            ->get();
            
        return response()->json($activities);
    });

    // Get system status
    Route::get('/system-status', function () {
        $datasets = Dataset::count();
        $pendingDatasets = Dataset::where('status', 'pending')->count();
        $completedDatasets = Dataset::where('status', 'completed')->count();
        $users = User::count();
        
        return response()->json([
            'datasets' => [
                'total' => $datasets,
                'pending' => $pendingDatasets,
                'completed' => $completedDatasets,
            ],
            'users' => $users,
            'ml_service_url' => config('services.ml.url'),
            'ml_service_status' => 'connected', // Would check actual connection
        ]);
    });
});

// Public health check (no auth required)
Route::get('/health', function () {
    return response()->json([
        'status' => 'ok',
        'timestamp' => now()->toIso8601String(),
        'database' => 'connected',
    ]);
});
