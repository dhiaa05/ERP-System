<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sync_sources', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100);
            $table->enum('driver', [
                'google_sheets_api',
                'apps_script_webhook',
                'csv_import',
            ])->default('csv_import');
            $table->boolean('is_active')->default(true);
            $table->json('config')->default('{}');
            $table->timestamp('last_synced_at')->nullable();
            $table->enum('last_sync_status', ['success', 'partial', 'failed', 'never'])->default('never');
            $table->unsignedInteger('sync_frequency_minutes')->default(30);
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();

            $table->index('driver');
            $table->index('is_active');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sync_sources');
    }
};
