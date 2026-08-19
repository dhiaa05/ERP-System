<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('carriers', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100);
            $table->string('code', 20)->unique();
            $table->boolean('is_active')->default(true);
            $table->string('api_key', 255)->nullable();
            $table->string('api_secret', 255)->nullable();
            $table->string('api_endpoint', 255)->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('carriers');
    }
};
