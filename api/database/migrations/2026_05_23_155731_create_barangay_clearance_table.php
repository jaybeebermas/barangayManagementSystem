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
        Schema::create('barangay_clearances', function (Blueprint $table) {
            $table->id();
            $table->string('clearance_number')->unique();
            $table->unsignedBigInteger('resident_id');
            $table->text('purpose');
            $table->unsignedBigInteger('issued_by');
            $table->date('issued_on');
            $table->date('valid_until');
            $table->string('status')->default('pending'); // pending, approved, released, expired
            $table->timestamps();

            // Indexes for search performance (no foreign key constraints)
            $table->index('clearance_number');
            $table->index('resident_id');
            $table->index('issued_by');
            $table->index('status');
            $table->index('issued_on');
            $table->index('valid_until');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('barangay_clearances');
    }
};
