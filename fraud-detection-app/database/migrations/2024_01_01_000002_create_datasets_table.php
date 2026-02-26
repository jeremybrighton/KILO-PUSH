<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * PHASE 3 — Datasets Table Migration
 * Stores metadata for uploaded CSV datasets.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('datasets', function (Blueprint $table) {
            $table->id();
            $table->string('filename');
            $table->string('path');                     // Storage path (private)
            $table->unsignedBigInteger('size_bytes');
            $table->unsignedInteger('row_count')->nullable(); // Set after ML processing
            $table->string('label');                    // User-defined label
            $table->text('description')->nullable();
            $table->enum('status', ['pending', 'processing', 'processed', 'failed'])->default('pending');
            $table->foreignId('uploaded_by')->constrained('users')->onDelete('cascade');
            $table->softDeletes();
            $table->timestamps();

            $table->index('status');
            $table->index('uploaded_by');
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('datasets');
    }
};
