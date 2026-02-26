<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * PHASE 3 — Audit Logs Table Migration
 * Immutable event log for compliance and security monitoring.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();
            $table->string('action');               // e.g. login, dataset_upload
            $table->text('description');
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('set null');
            $table->json('context')->nullable();    // Additional metadata
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->timestamp('created_at');        // No updated_at — logs are immutable

            $table->index('action');
            $table->index('user_id');
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
    }
};
