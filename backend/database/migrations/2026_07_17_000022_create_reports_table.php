<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reports', function (Blueprint $table) {
            $table->id();
            $table->enum('type', ['daily', 'weekly', 'monthly']);
            $table->date('period_start');
            $table->date('period_end');
            $table->enum('status', ['pending', 'processing', 'completed', 'failed'])->default('pending');
            $table->json('payload')->nullable(); // cached report data
            $table->foreignId('generated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['type', 'period_start']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reports');
    }
};
