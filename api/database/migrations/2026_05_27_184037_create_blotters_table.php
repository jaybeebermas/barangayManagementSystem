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
        Schema::create('blotters', function (Blueprint $table) {
            $table->id();
            $table->string('case_number')->unique();
            $table->string('complainant_name');
            $table->string('respondent_name');
            $table->datetime('incident_date');
            $table->string('incident_location');
            $table->text('complaint_description');
            $table->enum('status', ['Active', 'Settled', 'Unsettled', 'Elevated'])->default('Active');
            
            // Foreign key connecting to your existing Event model (nullable, since not all cases have scheduled hearings immediately)
            $table->unsignedBigInteger('event_id')->nullable();
            $table->foreign('event_id')->references('id')->on('events')->nullOnDelete();
            
            $table->text('resolution_details')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('blotters');
    }
};
