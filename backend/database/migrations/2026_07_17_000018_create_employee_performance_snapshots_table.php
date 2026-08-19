<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('employee_performance_snapshots', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained('employees')->cascadeOnDelete();
            $table->enum('period_type', ['daily', 'weekly', 'monthly']);
            $table->date('period_start');
            $table->date('period_end');

            // Order counts
            $table->unsignedInteger('total_orders')->default(0);
            $table->unsignedInteger('confirmed_orders')->default(0);
            $table->unsignedInteger('sent_orders')->default(0);
            $table->unsignedInteger('delivered_orders')->default(0);
            $table->unsignedInteger('cancelled_orders')->default(0);
            $table->unsignedInteger('returned_orders')->default(0);
            $table->unsignedInteger('refused_orders')->default(0);

            // Rate KPIs (0.0000 to 1.0000)
            $table->decimal('confirmation_rate', 8, 4)->default(0);
            $table->decimal('delivery_rate', 8, 4)->default(0);
            $table->decimal('refusal_rate', 8, 4)->default(0);
            $table->decimal('return_rate', 8, 4)->default(0);

            // Financial KPIs (DZD)
            $table->decimal('total_revenue', 15, 2)->default(0);
            $table->decimal('total_net_profit', 15, 2)->default(0);
            $table->decimal('avg_profit_per_order', 15, 2)->default(0);

            // Performance Score
            $table->decimal('performance_score', 6, 2)->default(0);  // 0.00–100.00
            $table->json('score_breakdown')->nullable(); // {delivery_rate: 28.5, confirmation_rate: 15.2, ...}
            $table->unsignedSmallInteger('rank')->nullable(); // rank among active employees this period
            $table->json('weights_snapshot');  // exact weights used — preserves historical accuracy

            $table->timestamp('computed_at')->nullable();
            $table->timestamps();

            $table->unique(['employee_id', 'period_type', 'period_start'], 'eps_employee_period_unique');
            $table->index(['employee_id', 'period_type', 'period_start'], 'eps_employee_period_idx');
            $table->index(['period_type', 'period_start', 'performance_score'], 'eps_leaderboard_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('employee_performance_snapshots');
    }
};
