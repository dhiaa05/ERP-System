<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->decimal('carrier_shipping_cost', 10, 2)->nullable()->after('total_amount');
            $table->decimal('carrier_return_cost', 10, 2)->nullable()->after('carrier_shipping_cost');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['carrier_shipping_cost', 'carrier_return_cost']);
        });
    }
};
