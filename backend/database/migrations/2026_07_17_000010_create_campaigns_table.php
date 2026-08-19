<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('campaigns', function (Blueprint $table) {
            $table->id();
            $table->string('name', 200);
            $table->foreignId('product_id')->constrained('products')->restrictOnDelete();
            $table->date('date');
            $table->decimal('facebook_spend', 15, 2)->default(0); // DZD
            $table->unsignedInteger('leads')->default(0);
            $table->text('notes')->nullable();
            $table->string('external_id', 100)->nullable(); // Future: Meta Campaign ID
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();

            $table->index('product_id');
            $table->index('date');
            $table->index('external_id');
            $table->index(['product_id', 'date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('campaigns');
    }
};
