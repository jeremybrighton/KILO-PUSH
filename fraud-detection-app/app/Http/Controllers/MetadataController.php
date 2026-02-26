<?php

namespace App\Http\Controllers;

/**
 * PHASE 3 — Metadata Controller
 * Provides read-only access to dataset metadata and audit logs.
 * Tracks who uploaded what, when, and what processing occurred.
 */

use App\Models\Dataset;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class MetadataController extends Controller
{
    // ── List metadata for all accessible datasets ─────
    public function index(Request $request)
    {
        $user = Auth::user();

        $metadata = Dataset::visibleTo($user)
            ->with(['uploader', 'jobLogs'])
            ->when($request->status, fn($q, $s) => $q->where('status', $s))
            ->when($request->from, fn($q, $d) => $q->whereDate('created_at', '>=', $d))
            ->when($request->to, fn($q, $d) => $q->whereDate('created_at', '<=', $d))
            ->latest()
            ->paginate(25);

        return view('metadata.index', compact('metadata'));
    }

    // ── Show metadata for a specific dataset ──────────
    public function show(Dataset $dataset)
    {
        $this->authorize('view', $dataset);

        $dataset->load(['uploader', 'jobLogs', 'fraudResults']);

        // Fetch audit trail for this dataset
        $auditTrail = AuditLog::where('context->dataset_id', $dataset->id)
            ->with('user')
            ->latest()
            ->get();

        return view('metadata.show', compact('dataset', 'auditTrail'));
    }
}
