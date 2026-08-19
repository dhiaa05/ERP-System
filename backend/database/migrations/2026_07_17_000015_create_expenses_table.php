<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('expenses', function (Blueprint $table) {
            $table->id();
            $table->date('date');
            $table->foreignId('expense_category_id')->constrained('expense_categories')->restrictOnDelete();
            $table->string('description', 500);
            $table->decimal('amount', 15, 2); // DZD
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();

            $table->index('date');
            $table->index('expense_category_id');
            $table->index(['date', 'expense_category_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('expenses');
    }
};
