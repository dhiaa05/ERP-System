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
            $table->timestamp('ordered_at')->nullable()->after('order_date');
            $table->foreignId('duplicate_of_id')->nullable()->constrained('orders')->nullOnDelete()->after('sync_source_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropForeign(['duplicate_of_id']);
            $table->dropColumn('duplicate_of_id');
            $table->dropColumn('ordered_at');
        });
    }
};
