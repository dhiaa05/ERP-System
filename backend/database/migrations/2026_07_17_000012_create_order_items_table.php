<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('order_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained('orders')->cascadeOnDelete();
            $table->foreignId('product_id')->constrained('products')->restrictOnDelete();
            $table->unsignedSmallInteger('quantity')->default(1);
            $table->decimal('selling_price', 15, 2);    // DZD — snapshot at sync time
            $table->decimal('purchase_cost', 15, 2);    // DZD — snapshot from products table
            $table->decimal('customer_shipping', 15, 2)->default(0); // charged to customer
            $table->decimal('carrier_cost', 15, 2)->default(0);      // cost to business
            $table->timestamps();

            $table->index('order_id');
            $table->index('product_id');
            $table->index(['order_id', 'product_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('order_items');
    }
};
