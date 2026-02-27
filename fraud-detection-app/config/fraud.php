<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Risk Threshold Configuration
    |--------------------------------------------------------------------------
    |
    | These thresholds determine when transactions are flagged as high,
    | medium, or low risk. Scores are on a 0-100 scale.
    |
    */
    'thresholds' => [
        'high_risk' => env('FRAUD_HIGH_RISK_THRESHOLD', 80),
        'medium_risk' => env('FRAUD_MEDIUM_RISK_THRESHOLD', 50),
        'low_risk' => env('FRAUD_LOW_RISK_THRESHOLD', 20),
    ],

    /*
    |--------------------------------------------------------------------------
    | Alert & Notification Configuration
    |--------------------------------------------------------------------------
    |
    | Control how alerts are delivered to your team.
    |
    */
    'alerts' => [
        'email_enabled' => env('FRAUD_ALERT_EMAIL_ENABLED', true),
        'slack_enabled' => env('FRAUD_ALERT_SLACK_ENABLED', false),
        'slack_webhook' => env('FRAUD_ALERT_SLACK_WEBHOOK', ''),
        'daily_report' => env('FRAUD_ALERT_DAILY_REPORT', true),
        'realtime' => env('FRAUD_ALERT_REALTIME', true),
        'alert_email' => env('FRAUD_ALERT_EMAIL', 'alerts@fraugguard.com'),
    ],

    /*
    |--------------------------------------------------------------------------
    | Vendor Monitoring Rules
    |--------------------------------------------------------------------------
    |
    | Configure rules for monitoring vendor transactions.
    |
    */
    'vendor' => [
        'blacklist' => explode(',', env('FRAUD_VENDOR_BLACKLIST', '')),
        'geo_restrictions' => env('FRAUD_VENDOR_GEO_RESTRICTIONS', false),
        'max_daily_limit' => env('FRAUD_VENDOR_MAX_DAILY_LIMIT', 10000),
        'frequency_sensitivity' => env('FRAUD_VENDOR_FREQUENCY_SENSITIVITY', 'medium'), // low, medium, high
    ],

    /*
    |--------------------------------------------------------------------------
    | ML Model Configuration
    |--------------------------------------------------------------------------
    |
    | Read-only information about the current fraud detection model.
    | Model training and updates are handled by the ML service.
    |
    */
    'model' => [
        'version' => env('FRAUD_MODEL_VERSION', '2.1.0'),
        'last_trained' => env('FRAUD_MODEL_LAST_TRAINED', '2026-02-15'),
        'accuracy' => env('FRAUD_MODEL_ACCURACY', '94.2%'),
        'confidence_threshold' => env('FRAUD_MODEL_CONFIDENCE_THRESHOLD', 0.75),
    ],
];
