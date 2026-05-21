<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Zone extends Model
{
    protected $table = 'zone';

    protected $fillable = [
        'zone_code',
        'zone_name',
        'leader',
        'status',
    ];

    protected $casts = [
        'status' => 'boolean',
    ];
}
