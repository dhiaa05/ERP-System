<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('sku', 50)->unique();
            $table->string('name', 200);
            $table->decimal('purchase_cost', 15, 2);
            $table->decimal('weight_grams', 8, 2)->nullable();
            $table->foreignId('category_id')->nullable()->constrained('categories')->nullOnDelete();
            $table->enum('status', ['active', 'inactive', 'discontinued'])->default('active');
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();

            $table->index('category_id');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
