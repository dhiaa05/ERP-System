<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sync_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sync_source_id')->constrained('sync_sources')->cascadeOnDelete();
            $table->timestamp('started_at');
            $table->timestamp('completed_at')->nullable();
            $table->enum('status', ['running', 'success', 'partial', 'failed'])->default('running');
            $table->unsignedInteger('rows_total')->default(0);
            $table->unsignedInteger('rows_created')->default(0);
            $table->unsignedInteger('rows_updated')->default(0);
            $table->unsignedInteger('rows_skipped')->default(0);
            $table->unsignedInteger('rows_failed')->default(0);
            $table->json('errors')->nullable(); // [{row: 5, error: "SKU not found"}, ...]
            $table->enum('triggered_by', ['scheduler', 'manual', 'webhook'])->default('scheduler');
            $table->timestamps();

            $table->index('sync_source_id');
            $table->index('started_at');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sync_logs');
    }
};
