<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * PHASE 3 — Job Logs Table Migration
 * Tracks background ML processing job lifecycle.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('job_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('dataset_id')->constrained()->onDelete('cascade');
            $table->foreignId('triggered_by')->nullable()->constrained('users')->onDelete('set null');
            $table->string('job_reference')->unique(); // UUID for correlation with Python
            $table->enum('status', ['pending', 'processing', 'completed', 'failed', 'retrying'])->default('pending');
            $table->unsignedTinyInteger('retry_count')->default(0);
            $table->text('error_message')->nullable();
            $table->timestamp('started_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();

            $table->index('status');
            $table->index('dataset_id');
            $table->index('job_reference');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('job_logs');
    }
};
