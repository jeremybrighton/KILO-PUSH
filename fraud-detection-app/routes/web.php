<?php

/**
 * PHASE 3 — Laravel Core System Routes
 * Defines all web routes for authentication, dataset management,
 * job monitoring, and admin panel. ML logic is intentionally excluded.
 */

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\DatasetController;
use App\Http\Controllers\JobController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\MetadataController;

// ─────────────────────────────────────────────
// PUBLIC ROUTES — No authentication required
// ─────────────────────────────────────────────
Route::get('/', fn() => redirect()->route('login'));

// Authentication routes
Route::get('/login',    [AuthController::class, 'showLogin'])->name('login');
Route::post('/login',   [AuthController::class, 'login'])->name('login.post');
Route::get('/register', [AuthController::class, 'showRegister'])->name('register');
Route::post('/register',[AuthController::class, 'register'])->name('register.post');
Route::post('/logout',  [AuthController::class, 'logout'])->name('logout');

// Password reset
Route::get('/forgot-password',          [AuthController::class, 'showForgotPassword'])->name('password.request');
Route::post('/forgot-password',         [AuthController::class, 'sendResetLink'])->name('password.email');
Route::get('/reset-password/{token}',   [AuthController::class, 'showResetForm'])->name('password.reset');
Route::post('/reset-password',          [AuthController::class, 'resetPassword'])->name('password.update');

// ─────────────────────────────────────────────
// AUTHENTICATED ROUTES — All roles
// ─────────────────────────────────────────────
Route::middleware(['auth'])->group(function () {

    // Dashboard — role-aware landing page
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // ── Dataset Management ──────────────────────
    Route::prefix('datasets')->name('datasets.')->group(function () {
        Route::get('/',             [DatasetController::class, 'index'])->name('index');
        Route::get('/upload',       [DatasetController::class, 'showUpload'])->name('upload');
        Route::post('/upload',      [DatasetController::class, 'store'])->name('store');
        Route::get('/{dataset}',    [DatasetController::class, 'show'])->name('show');
        Route::delete('/{dataset}', [DatasetController::class, 'destroy'])->name('destroy');
    });

    // ── Job Queue Monitoring ────────────────────
    Route::prefix('jobs')->name('jobs.')->group(function () {
        Route::get('/',         [JobController::class, 'index'])->name('index');
        Route::get('/{job}',    [JobController::class, 'show'])->name('show');
        Route::post('/{job}/retry', [JobController::class, 'retry'])->name('retry');
    });

    // ── Metadata & Audit Logs ───────────────────
    Route::prefix('metadata')->name('metadata.')->group(function () {
        Route::get('/',             [MetadataController::class, 'index'])->name('index');
        Route::get('/{metadata}',   [MetadataController::class, 'show'])->name('show');
    });
});

// ─────────────────────────────────────────────
// ADMIN ROUTES — Admin role only
// ─────────────────────────────────────────────
Route::middleware(['auth', 'role:admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/',                         [AdminController::class, 'index'])->name('index');
    Route::get('/users',                    [AdminController::class, 'users'])->name('users');
    Route::post('/users/{user}/role',       [AdminController::class, 'updateRole'])->name('users.role');
    Route::delete('/users/{user}',          [AdminController::class, 'destroyUser'])->name('users.destroy');
    Route::get('/system-logs',              [AdminController::class, 'systemLogs'])->name('system-logs');
});

// ─────────────────────────────────────────────
// ANALYST ROUTES — Analyst + Admin roles
// ─────────────────────────────────────────────
Route::middleware(['auth', 'role:admin,analyst'])->prefix('analytics')->name('analytics.')->group(function () {
    // PHASE 5 — Dashboard routes (placeholders until ML integration)
    Route::get('/fraud-map',        [DashboardController::class, 'fraudMap'])->name('fraud-map');
    Route::get('/vendor-risk',      [DashboardController::class, 'vendorRisk'])->name('vendor-risk');
    Route::get('/time-series',      [DashboardController::class, 'timeSeries'])->name('time-series');
    Route::get('/anomalies',        [DashboardController::class, 'anomalies'])->name('anomalies');

    // PHASE 6 — Explainability routes
    Route::get('/explain/{transaction}',    [DashboardController::class, 'explain'])->name('explain');
    Route::get('/reports',                  [DashboardController::class, 'reports'])->name('reports');
});
