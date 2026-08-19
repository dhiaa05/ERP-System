<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('analytics_events', function (Blueprint $table) {
            $table->id();
            $table->string('event_type', 100); // 'order.delivered', 'kpi.threshold_breached'
            $table->string('subject_type', 50)->nullable();
            $table->unsignedBigInteger('subject_id')->nullable();
            $table->json('payload'); // full event data
            $table->timestamp('occurred_at');
            // No updated_at — append-only event stream
            $table->timestamp('created_at')->useCurrent();

            $table->index('event_type');
            $table->index(['subject_type', 'subject_id']);
            $table->index('occurred_at');
            $table->index(['event_type', 'occurred_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('analytics_events');
    }
};
