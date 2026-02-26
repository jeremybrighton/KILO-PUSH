<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * PHASE 4 — Fraud Results Table Migration
 * Stores ML prediction results from the Python microservice.
 * Populated via the /api/internal/ml-results callback endpoint.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('fraud_results', function (Blueprint $table) {
            $table->id();
            $table->foreignId('dataset_id')->constrained()->onDelete('cascade');
            $table->string('transaction_id');           // Original transaction ID from CSV
            $table->decimal('fraud_score', 5, 4);       // 0.0000 to 1.0000
            $table->boolean('is_fraud')->default(false);
            $table->boolean('is_anomaly')->default(false);
            $table->string('vendor_id')->nullable();
            $table->string('vendor_name')->nullable();
            $table->string('region')->nullable();
            $table->decimal('amount', 15, 2)->nullable();
            $table->timestamps();

            $table->index('transaction_id');
            $table->index('is_fraud');
            $table->index('is_anomaly');
            $table->index('fraud_score');
            $table->index('vendor_id');
            $table->index('region');
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('fraud_results');
    }
};
