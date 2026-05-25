<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;

class Official extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'position',
        'type',
        'email',
        'contact_number',
        'term_start',
        'term_end',
        'photo_path',
        'status',
    ];

    protected $casts = [
        'status' => 'boolean',
        'term_start' => 'date',
        'term_end' => 'date',
    ];

    /**
     * Scope to filter by type (BARANGAY or SK).
     */
    public function scopeOfType(Builder $query, string $type): Builder
    {
        return $query->where('type', $type);
    }
}
