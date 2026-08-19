<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sync_column_mappings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sync_source_id')->constrained('sync_sources')->cascadeOnDelete();
            $table->string('sheet_column', 100);   // exact header name from source
            $table->string('internal_field', 100);  // internal field name
            $table->string('transform', 50)->nullable(); // normalize_phone, parse_date, resolve_wilaya...
            $table->boolean('is_required')->default(false);
            $table->string('default_value', 255)->nullable();
            $table->timestamps();

            $table->unique(['sync_source_id', 'sheet_column']);
            $table->index(['sync_source_id', 'sheet_column']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sync_column_mappings');
    }
};
