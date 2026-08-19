<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ai_snapshots', function (Blueprint $table) {
            $table->id();
            $table->date('snapshot_date');
            $table->enum('entity_type', ['order', 'product', 'employee', 'campaign', 'wilaya']);
            $table->unsignedBigInteger('entity_id');

            // Order facts
            $table->unsignedInteger('total_orders')->default(0);
            $table->unsignedInteger('confirmed_orders')->default(0);
            $table->unsignedInteger('delivered_orders')->default(0);

            // Financial facts (DZD)
            $table->decimal('revenue', 15, 2)->default(0);
            $table->decimal('gross_profit', 15, 2)->default(0);
            $table->decimal('net_profit', 15, 2)->default(0);
            $table->decimal('marketing_spend', 15, 2)->default(0);

            // Rate facts (0.0000–1.0000)
            $table->decimal('confirmation_rate', 8, 4)->default(0);
            $table->decimal('delivery_rate', 8, 4)->default(0);
            $table->decimal('refusal_rate', 8, 4)->default(0);
            $table->decimal('return_rate', 8, 4)->default(0);

            // Score (employees only)
            $table->decimal('performance_score', 6, 2)->nullable();

            // Flexible ML feature storage
            $table->json('features')->nullable();

            $table->timestamps();

            $table->index(['entity_type', 'entity_id', 'snapshot_date']);
            $table->index(['snapshot_date', 'entity_type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ai_snapshots');
    }
};
