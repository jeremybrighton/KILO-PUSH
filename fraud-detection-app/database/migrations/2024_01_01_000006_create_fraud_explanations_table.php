<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * PHASE 6 — Fraud Explanations Table Migration
 * Stores SHAP-based feature importance and human-readable narratives.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('fraud_explanations', function (Blueprint $table) {
            $table->id();
            $table->string('transaction_id')->unique(); // Links to fraud_results.transaction_id
            $table->foreignId('dataset_id')->constrained()->onDelete('cascade');
            $table->json('top_features');               // [{name, value, impact}, ...]
            $table->json('shap_values')->nullable();    // Full SHAP array (optional)
            $table->decimal('base_value', 8, 6)->nullable(); // SHAP base/expected value
            $table->text('narrative');                  // Human-readable explanation
            $table->timestamps();

            $table->index('transaction_id');
            $table->index('dataset_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('fraud_explanations');
    }
};
