<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('expense_categories', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100);
            $table->string('slug', 110)->unique();
            $table->text('description')->nullable();
            $table->boolean('is_system')->default(false); // system categories cannot be deleted
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('expense_categories');
    }
};
