<?php

namespace App\Services;

/**
 * PHASE 4 — ML API Service
 * Handles all HTTP communication between Laravel and the Python ML microservice.
 * Centralizes API calls, error handling, retries, and logging.
 *
 * Python ML service base URL is configured in .env:
 *   ML_SERVICE_URL=http://ml-service:5000
 *   ML_SERVICE_SECRET=your-shared-secret
 */

use App\Models\AuditLog;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\RequestException;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class MlApiService
{
    private string $baseUrl;
    private string $secret;
    private int $timeoutSeconds;

    public function __construct()
    {
        $this->baseUrl        = config('services.ml.url', 'http://localhost:5000');
        $this->secret         = config('services.ml.secret', '');
        $this->timeoutSeconds = config('services.ml.timeout', 30);
    }

    // ── Trigger dataset processing ────────────────────
    // Laravel → Python: "Please process this dataset"
    public function processDataset(
        int    $datasetId,
        string $datasetPath,
        string $jobReference,
        string $callbackUrl
    ): array {
        $payload = [
            'dataset_id'   => $datasetId,
            'dataset_path' => storage_path("app/{$datasetPath}"),
            'job_id'       => $jobReference,
            'callback_url' => $callbackUrl,
        ];

        return $this->post('/process-dataset', $payload);
    }

    // ── Request SHAP explanations ─────────────────────
    // Laravel → Python: "Please explain these predictions"
    public function requestExplanations(
        int    $datasetId,
        string $jobReference,
        string $callbackUrl
    ): array {
        $payload = [
            'dataset_id'   => $datasetId,
            'job_id'       => $jobReference,
            'callback_url' => $callbackUrl,
        ];

        return $this->post('/explain', $payload);
    }

    // ── Health check ──────────────────────────────────
    public function healthCheck(): bool
    {
        try {
            $response = Http::timeout(5)
                ->withHeaders($this->authHeaders())
                ->get("{$this->baseUrl}/health");

            return $response->successful();
        } catch (\Exception $e) {
            Log::warning('ML service health check failed: ' . $e->getMessage());
            return false;
        }
    }

    // ── Internal HTTP POST helper ─────────────────────
    private function post(string $endpoint, array $payload): array
    {
        try {
            $response = Http::timeout($this->timeoutSeconds)
                ->withHeaders($this->authHeaders())
                ->retry(2, 1000) // Retry twice with 1s delay
                ->post("{$this->baseUrl}{$endpoint}", $payload);

            if ($response->failed()) {
                $this->logApiError($endpoint, $response->status(), $response->body());
                throw new \RuntimeException(
                    "ML service returned HTTP {$response->status()} for {$endpoint}: " . $response->body()
                );
            }

            return $response->json();

        } catch (ConnectionException $e) {
            // Python service is unreachable
            $this->logApiError($endpoint, 0, 'Connection refused: ' . $e->getMessage());
            throw new \RuntimeException(
                "Cannot connect to ML service at {$this->baseUrl}. Is it running?"
            );

        } catch (RequestException $e) {
            $this->logApiError($endpoint, $e->response->status(), $e->getMessage());
            throw new \RuntimeException("ML API request failed: " . $e->getMessage());
        }
    }

    // ── Auth headers for Python service ──────────────
    private function authHeaders(): array
    {
        return [
            'X-ML-Secret'  => $this->secret,
            'Content-Type' => 'application/json',
            'Accept'       => 'application/json',
        ];
    }

    // ── Log API errors ────────────────────────────────
    private function logApiError(string $endpoint, int $status, string $body): void
    {
        Log::error("ML API error", [
            'endpoint' => $endpoint,
            'status'   => $status,
            'body'     => substr($body, 0, 500),
        ]);

        AuditLog::record(
            'ml_api_error',
            "ML API call to {$endpoint} failed with status {$status}",
            null,
            ['endpoint' => $endpoint, 'status' => $status]
        );
    }
}
