<?php

namespace App\Http\Controllers;

/**
 * PHASE 3 — Job Queue Controller
 * Provides visibility into background job status for admins and analysts.
 * Jobs represent ML processing tasks dispatched to the queue.
 * Allows manual retry of failed jobs.
 */

use App\Models\JobLog;
use App\Models\Dataset;
use App\Jobs\ProcessDatasetJob;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class JobController extends Controller
{
    public function __construct()
    {
        // Only admins and analysts can view job queue
        $this->middleware('role:admin,analyst');
    }

    // ── List all job logs with status ─────────────────
    public function index(Request $request)
    {
        $jobs = JobLog::with(['dataset', 'triggeredBy'])
            ->when($request->status, fn($q, $s) => $q->where('status', $s))
            ->when($request->dataset_id, fn($q, $id) => $q->where('dataset_id', $id))
            ->latest()
            ->paginate(25);

        $statusCounts = JobLog::selectRaw('status, count(*) as count')
            ->groupBy('status')
            ->pluck('count', 'status');

        return view('jobs.index', compact('jobs', 'statusCounts'));
    }

    // ── Show individual job details ───────────────────
    public function show(JobLog $job)
    {
        $job->load(['dataset', 'triggeredBy']);

        return view('jobs.show', compact('job'));
    }

    // ── Retry a failed job ────────────────────────────
    public function retry(JobLog $job)
    {
        if ($job->status !== 'failed') {
            return back()->with('error', 'Only failed jobs can be retried.');
        }

        $dataset = Dataset::findOrFail($job->dataset_id);

        // Re-dispatch the processing job
        ProcessDatasetJob::dispatch($dataset)->onQueue('ml-processing');

        $job->update(['status' => 'retrying', 'retry_count' => $job->retry_count + 1]);

        return back()->with('success', 'Job has been re-queued for processing.');
    }
}
