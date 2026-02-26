<?php

/**
 * PHASE 4 — Services Configuration
 * Add ML service configuration to Laravel's services config.
 * Merge this into your existing config/services.php
 */

return [

    // ... existing services (mailgun, postmark, ses, etc.)

    // ── Python ML Microservice ────────────────────────
    'ml' => [
        'url'     => env('ML_SERVICE_URL', 'http://localhost:5000'),
        'secret'  => env('ML_SERVICE_SECRET', ''),
        'timeout' => env('ML_SERVICE_TIMEOUT', 30),
    ],

];
