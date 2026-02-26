<?php

namespace App\Http\Controllers;

/**
 * PHASE 3 — Dataset Controller
 * Handles CSV dataset uploads, validation, storage, and metadata logging.
 * After upload, dispatches a background job to trigger ML processing (Phase 4).
 * No ML logic lives here — this controller only manages file lifecycle.
 */

use App\Models\Dataset;
use App\Models\AuditLog;
use App\Jobs\ProcessDatasetJob;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class DatasetController extends Controller
{
    // ── List all datasets for the authenticated user ──
    public function index()
    {
        // Admins and analysts see all datasets; vendors see only their own
        $datasets = Auth::user()->isAdmin() || Auth::user()->isAnalyst()
            ? Dataset::with('uploader')->latest()->paginate(20)
            : Dataset::where('uploaded_by', Auth::id())->latest()->paginate(20);

        return view('datasets.index', compact('datasets'));
    }

    // ── Show upload form ──────────────────────────────
    public function showUpload()
    {
        return view('datasets.upload');
    }

    // ── Handle file upload and dispatch processing job ─
    public function store(Request $request)
    {
        // Validate: only CSV, max 50MB
        $request->validate([
            'dataset'     => ['required', 'file', 'mimes:csv,txt', 'max:51200'],
            'description' => ['nullable', 'string', 'max:500'],
            'label'       => ['required', 'string', 'max:100'],
        ]);

        $file = $request->file('dataset');

        // Store file in private storage (not publicly accessible)
        $path = $file->store('datasets/' . date('Y/m'), 'local');

        // Create dataset metadata record
        $dataset = Dataset::create([
            'filename'      => $file->getClientOriginalName(),
            'path'          => $path,
            'size_bytes'    => $file->getSize(),
            'row_count'     => null, // Populated after ML processing
            'label'         => $request->input('label'),
            'description'   => $request->input('description'),
            'status'        => 'pending',
            'uploaded_by'   => Auth::id(),
        ]);

        // Log the upload event for audit trail
        AuditLog::record(
            'dataset_upload',
            "Dataset '{$dataset->label}' uploaded ({$dataset->filename})",
            Auth::id(),
            ['dataset_id' => $dataset->id]
        );

        // Dispatch background job — this triggers Python ML processing (Phase 4)
        // Using queue to avoid blocking the HTTP request
        ProcessDatasetJob::dispatch($dataset)->onQueue('ml-processing');

        return redirect()
            ->route('datasets.show', $dataset)
            ->with('success', 'Dataset uploaded successfully. Processing has been queued.');
    }

    // ── Show dataset details and processing status ────
    public function show(Dataset $dataset)
    {
        $this->authorize('view', $dataset);

        $dataset->load(['uploader', 'fraudResults', 'jobLogs']);

        return view('datasets.show', compact('dataset'));
    }

    // ── Delete a dataset ──────────────────────────────
    public function destroy(Dataset $dataset)
    {
        $this->authorize('delete', $dataset);

        // Remove file from storage
        Storage::disk('local')->delete($dataset->path);

        AuditLog::record(
            'dataset_delete',
            "Dataset '{$dataset->label}' deleted",
            Auth::id(),
            ['dataset_id' => $dataset->id]
        );

        $dataset->delete();

        return redirect()
            ->route('datasets.index')
            ->with('success', 'Dataset deleted successfully.');
    }
}
