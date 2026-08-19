<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('communes', function (Blueprint $table) {
            $table->id();
            $table->unsignedTinyInteger('wilaya_id');
            $table->string('name_ar', 100);
            $table->string('name_fr', 100);
            $table->timestamps();

            $table->foreign('wilaya_id')->references('id')->on('wilayas')->restrictOnDelete();
            $table->index('wilaya_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('communes');
    }
};
