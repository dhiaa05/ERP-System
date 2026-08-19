<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('kpi_snapshots', function (Blueprint $table) {
            $table->id();
            $table->date('snapshot_date')->unique();

            // Order counts
            $table->unsignedInteger('total_orders')->default(0);
            $table->unsignedInteger('confirmed_orders')->default(0);
            $table->unsignedInteger('delivered_orders')->default(0);
            $table->unsignedInteger('cancelled_orders')->default(0);
            $table->unsignedInteger('returned_orders')->default(0);
            $table->unsignedInteger('refused_orders')->default(0);
            $table->unsignedInteger('unreachable_orders')->default(0);
            $table->unsignedInteger('total_leads')->default(0);

            // Financial KPIs (DZD)
            $table->decimal('revenue', 15, 2)->default(0);           // delivered only
            $table->decimal('expected_revenue', 15, 2)->default(0);  // pending+confirmed+sent
            $table->decimal('gross_profit', 15, 2)->default(0);
            $table->decimal('net_profit', 15, 2)->default(0);
            $table->decimal('expected_profit', 15, 2)->default(0);
            $table->decimal('marketing_spend', 15, 2)->default(0);
            $table->decimal('total_expenses', 15, 2)->default(0);
            $table->decimal('avg_order_value', 15, 2)->default(0);
            $table->decimal('avg_profit', 15, 2)->default(0);

            // Rate KPIs (0.0000 to 1.0000)
            $table->decimal('confirmation_rate', 8, 4)->default(0);
            $table->decimal('delivery_rate', 8, 4)->default(0);
            $table->decimal('refusal_rate', 8, 4)->default(0);
            $table->decimal('return_rate', 8, 4)->default(0);
            $table->decimal('roas', 8, 4)->default(0);

            // Marketing KPIs (DZD)
            $table->decimal('cost_per_lead', 15, 2)->default(0);
            $table->decimal('cost_per_confirmed', 15, 2)->default(0);
            $table->decimal('cost_per_delivered', 15, 2)->default(0);
            $table->decimal('contribution_margin', 8, 4)->default(0);

            $table->timestamp('computed_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('kpi_snapshots');
    }
};
