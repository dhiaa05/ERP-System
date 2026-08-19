<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('employees', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100);
            $table->string('phone', 20)->nullable();
            $table->enum('role', ['confirmation', 'support', 'logistics', 'other'])->default('confirmation');
            $table->boolean('is_active')->default(true);
            $table->decimal('salary', 15, 2)->default(0); // DZD/month
            $table->date('hire_date')->nullable();
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();

            $table->index('role');
            $table->index('is_active');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('employees');
    }
};
