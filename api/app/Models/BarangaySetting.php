<?php declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BarangaySetting extends Model
{
    protected $table = 'barangay_settings';

    protected $fillable = [
        'barangay_name',
        'municipality',
        'province',
        'region',
        'zip_code',
        'contact_number',
        'email',
        'logo_path',
        'timezone',
        'date_format',
    ];
}
