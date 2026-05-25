<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('officials', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('position'); // e.g. 'Barangay Captain', 'SK Chairperson', 'Councilor'
            $table->enum('type', ['BARANGAY', 'SK'])->default('BARANGAY');
            $table->string('email')->nullable();
            $table->string('contact_number')->nullable();
            $table->date('term_start')->nullable();
            $table->date('term_end')->nullable();
            $table->string('photo_path')->nullable();
            $table->boolean('status')->default(true); // true = Active, false = Inactive
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('officials');
    }
};
