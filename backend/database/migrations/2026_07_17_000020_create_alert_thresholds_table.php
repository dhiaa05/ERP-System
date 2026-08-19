<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('alert_thresholds', function (Blueprint $table) {
            $table->id();
            $table->string('key', 100)->unique();
            $table->string('label', 200);
            $table->text('description')->nullable();
            $table->string('metric', 100); // 'delivery_rate', 'refusal_rate', etc.
            $table->enum('operator', ['lt', 'gt', 'lte', 'gte', 'eq']);
            $table->decimal('threshold_value', 15, 4);
            $table->boolean('is_active')->default(true);
            $table->enum('severity', ['info', 'warning', 'critical'])->default('warning');
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index('is_active');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('alert_thresholds');
    }
};
