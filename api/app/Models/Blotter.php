<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Blotter extends Model
{
    use HasFactory;

    protected $fillable = [
        'case_number',
        'complainant_name',
        'respondent_name',
        'incident_date',
        'incident_location',
        'complaint_description',
        'status',
        'event_id',
        'resolution_details',
    ];

    protected $casts = [
        'incident_date' => 'datetime',
        'event_id' => 'integer',
    ];

    /**
     * Relationship to the scheduled hearing Event
     */
    public function event()
    {
        return $this->belongsTo(Event::class, 'event_id');
    }
}
