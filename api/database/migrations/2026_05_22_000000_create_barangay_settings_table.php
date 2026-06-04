<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('barangay_settings', function (Blueprint $table) {
            $table->id();
            $table->string('barangay_name')->nullable();
            $table->string('municipality')->nullable();
            $table->string('province')->nullable();
            $table->string('region')->nullable();
            $table->string('zip_code')->nullable();
            $table->string('contact_number')->nullable();
            $table->string('email')->nullable();
            $table->string('logo_path')->nullable();
            $table->string('timezone')->default('Asia/Manila');
            $table->string('date_format')->default('MM/DD/YYYY');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('barangay_settings');
    }
};
