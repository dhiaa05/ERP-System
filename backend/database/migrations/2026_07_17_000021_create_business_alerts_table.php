<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('business_alerts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('alert_threshold_id')->constrained('alert_thresholds')->cascadeOnDelete();
            $table->string('subject_type', 50)->nullable(); // 'global', 'employee', 'product'
            $table->unsignedBigInteger('subject_id')->nullable();
            $table->string('subject_label', 200)->nullable(); // denormalized for display speed
            $table->enum('severity', ['info', 'warning', 'critical']);
            $table->string('title', 300); // "⚠ Delivery rate dropped to 68%"
            $table->text('description')->nullable();
            $table->decimal('current_value', 15, 4)->nullable();
            $table->decimal('threshold_value', 15, 4)->nullable();
            $table->date('period_start');
            $table->date('period_end');
            $table->boolean('is_dismissed')->default(false);
            $table->foreignId('dismissed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('dismissed_at')->nullable();
            $table->timestamps();

            $table->index('is_dismissed');
            $table->index('severity');
            $table->index(['subject_type', 'subject_id']);
            $table->index('created_at');
            $table->index(['is_dismissed', 'created_at']); // dashboard: active alerts sorted by date
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('business_alerts');
    }
};
