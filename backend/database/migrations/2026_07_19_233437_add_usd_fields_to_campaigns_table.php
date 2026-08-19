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
        Schema::table('campaigns', function (Blueprint $table) {
            $table->decimal('spend_usd', 10, 2)->nullable()->after('facebook_spend');
            $table->decimal('exchange_rate', 10, 2)->nullable()->after('spend_usd');
        });
    }

    public function down(): void
    {
        Schema::table('campaigns', function (Blueprint $table) {
            $table->dropColumn(['spend_usd', 'exchange_rate']);
        });
    }
};
