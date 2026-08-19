<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('order_status_history', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained('orders')->cascadeOnDelete();
            $table->string('old_status', 30)->nullable();
            $table->string('new_status', 30);
            $table->foreignId('changed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->enum('source', ['sync', 'manual'])->default('sync');
            $table->text('notes')->nullable();
            // No updated_at — this table is append-only (immutable audit log)
            $table->timestamp('created_at')->useCurrent();

            $table->index('order_id');
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('order_status_history');
    }
};
