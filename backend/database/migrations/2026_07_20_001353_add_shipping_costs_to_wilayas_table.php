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
        Schema::table('wilayas', function (Blueprint $table) {
            $table->decimal('real_shipping_cost_home', 8, 2)->nullable()->after('name_fr');
            $table->decimal('real_shipping_cost_desk', 8, 2)->nullable()->after('real_shipping_cost_home');
            $table->decimal('return_cost', 8, 2)->nullable()->after('real_shipping_cost_desk');
        });
    }

    public function down(): void
    {
        Schema::table('wilayas', function (Blueprint $table) {
            $table->dropColumn(['real_shipping_cost_home', 'real_shipping_cost_desk', 'return_cost']);
        });
    }
};
