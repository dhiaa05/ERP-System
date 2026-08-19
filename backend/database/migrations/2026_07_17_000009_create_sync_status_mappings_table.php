<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sync_status_mappings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sync_source_id')->constrained('sync_sources')->cascadeOnDelete();
            $table->string('sheet_value', 100); // e.g. "confirmé", "oui", "livré"
            $table->string('internal_status', 30); // maps to order status ENUM
            $table->timestamps();

            $table->unique(['sync_source_id', 'sheet_value']);
            $table->index(['sync_source_id', 'sheet_value']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sync_status_mappings');
    }
};
