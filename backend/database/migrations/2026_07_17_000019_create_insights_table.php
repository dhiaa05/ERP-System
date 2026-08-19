<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('insights', function (Blueprint $table) {
            $table->id();
            $table->enum('type', [
                'employee_positive',
                'employee_warning',
                'product_positive',
                'product_warning',
                'business_positive',
                'business_warning',
                'trend',
            ]);
            $table->string('subject_type', 50)->nullable(); // 'employee', 'product', 'campaign'
            $table->unsignedBigInteger('subject_id')->nullable(); // polymorphic reference
            $table->date('period_start');
            $table->date('period_end');
            $table->string('text', 500); // human-readable insight
            $table->json('data')->nullable(); // raw numbers behind the text
            $table->boolean('is_read')->default(false);
            $table->timestamps();

            $table->index('type');
            $table->index(['subject_type', 'subject_id']);
            $table->index('period_start');
            $table->index('is_read');
            $table->index(['period_start', 'type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('insights');
    }
};
