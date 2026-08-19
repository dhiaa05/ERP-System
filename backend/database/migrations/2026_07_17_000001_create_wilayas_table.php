<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('wilayas', function (Blueprint $table) {
            $table->unsignedTinyInteger('id')->autoIncrement();
            $table->string('code', 5)->unique();
            $table->string('name_ar', 100);
            $table->string('name_fr', 100);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('wilayas');
    }
};
