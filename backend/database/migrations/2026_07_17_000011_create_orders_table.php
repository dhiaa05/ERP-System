<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('reference', 50)->unique();           // auto: ORD-20260717-00001
            $table->string('external_reference', 200)->nullable()->unique(); // sheet/Ecotrack ID
            $table->date('order_date');
            $table->string('customer_name', 150);
            $table->string('customer_phone', 20);
            $table->unsignedTinyInteger('wilaya_id');
            $table->foreignId('commune_id')->nullable()->constrained('communes')->nullOnDelete();
            $table->foreignId('campaign_id')->nullable()->constrained('campaigns')->nullOnDelete();
            $table->foreignId('carrier_id')->nullable()->constrained('carriers')->nullOnDelete();
            $table->foreignId('confirmed_by')->nullable()->constrained('employees')->nullOnDelete();
            $table->string('tracking_number', 100)->nullable();
            $table->enum('status', [
                'pending',
                'confirmed',
                'sent',
                'delivered',
                'cancelled',
                'returned',
                'refused',
                'unreachable',
            ])->default('pending');
            $table->foreignId('sync_source_id')->nullable()->constrained('sync_sources')->nullOnDelete();
            $table->json('sync_metadata')->nullable(); // unmapped sheet columns preserved
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('wilaya_id')->references('id')->on('wilayas')->restrictOnDelete();

            // Core query indexes
            $table->index('order_date');
            $table->index('status');
            $table->index('wilaya_id');
            $table->index('campaign_id');
            $table->index('confirmed_by');
            $table->index('sync_source_id');
            $table->index('customer_phone');

            // Composite indexes for analytics queries
            $table->index(['order_date', 'status']);
            $table->index(['wilaya_id', 'status']);
            $table->index(['confirmed_by', 'status']);
            $table->index(['confirmed_by', 'order_date']);
            $table->index(['status', 'order_date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
