<?php

namespace App\Jobs;

/**
 * PHASE 4 — Process Dataset Job
 * Background job that calls the Python ML microservice asynchronously.
 * Dispatched by DatasetController after a CSV upload.
 *
 * Why async? Python ML processing can take minutes for large datasets.
 * Using Laravel Queues prevents blocking the HTTP request and gives
 * users immediate feedback while processing happens in the background.
 *
 * Queue: ml-processing (configure in config/queue.php)
 * Driver: Redis (recommended) or database
 */

use App\Models\Dataset;
use App\Models\JobLog;
use App\Models\AuditLog;
use App\Services\MlApiService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Str;
use Throwable;

class ProcessDatasetJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    // Retry up to 3 times on failure
    public int $tries = 3;

    // Wait 60 seconds between retries (exponential backoff)
    public int $backoff = 60;

    // Timeout after 10 minutes (large datasets may take time)
    public int $timeout = 600;

    private string $jobReference;

    public function __construct(
        private Dataset $dataset
    ) {
        $this->jobReference = Str::uuid()->toString();
    }

    // ── Main job handler ──────────────────────────────
    public function handle(MlApiService $mlApi): void
    {
        // Create job log entry for tracking
        $jobLog = JobLog::create([
            'dataset_id'    => $this->dataset->id,
            'triggered_by'  => $this->dataset->uploaded_by,
            'job_reference' => $this->jobReference,
            'status'        => 'processing',
            'started_at'    => now(),
        ]);

        // Update dataset status
        $this->dataset->update(['status' => 'processing']);

        // Call Python ML microservice
        // MlApiService handles HTTP communication and error handling
        $mlApi->processDataset(
            datasetId:    $this->dataset->id,
            datasetPath:  $this->dataset->path,
            jobReference: $this->jobReference,
            callbackUrl:  route('api.internal.ml-results') // Python posts results here
        );

        // Note: Job log is updated by FraudResultApiController when Python
        // posts results back via the callback URL. This job's role is only
        // to trigger the Python service — not to wait for results.

        AuditLog::record(
            'ml_job_dispatched',
            "ML processing job dispatched for dataset #{$this->dataset->id}",
            $this->dataset->uploaded_by,
            ['dataset_id' => $this->dataset->id, 'job_reference' => $this->jobReference]
        );
    }

    // ── Handle job failure ────────────────────────────
    public function failed(Throwable $exception): void
    {
        // Update job log with failure details
        JobLog::where('job_reference', $this->jobReference)
            ->update([
                'status'        => 'failed',
                'error_message' => $exception->getMessage(),
                'completed_at'  => now(),
            ]);

        // Mark dataset as failed
        $this->dataset->update(['status' => 'failed']);

        AuditLog::record(
            'ml_job_failed',
            "ML processing job failed for dataset #{$this->dataset->id}: " . $exception->getMessage(),
            $this->dataset->uploaded_by,
            ['dataset_id' => $this->dataset->id, 'error' => $exception->getMessage()]
        );
    }
}
