<?php declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BarangayClearance extends Model
{
    protected $table = 'barangay_clearances';

    protected $fillable = [
        'clearance_number',
        'resident_id',
        'purpose',
        'issued_by',
        'issued_on',
        'valid_until',
        'status',
    ];

    protected $casts = [
        'issued_on' => 'date',
        'valid_until' => 'date',
    ];

    /**
     * The resident this clearance belongs to.
     */
    public function resident(): BelongsTo
    {
        return $this->belongsTo(ResidentProfile::class, 'resident_id');
    }

    /**
     * The user who issued this clearance.
     */
    public function issuer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'issued_by');
    }

    /**
     * Auto-generate a unique clearance number.
     * Format: BC-YYYY-000001
     */
    public static function generateClearanceNumber(): string
    {
        $year = date('Y');
        $prefix = "BC-{$year}-";

        $lastClearance = static::where('clearance_number', 'like', "{$prefix}%")
            ->orderByDesc('clearance_number')
            ->first();

        if ($lastClearance) {
            $lastNumber = (int) substr($lastClearance->clearance_number, strlen($prefix));
            $nextNumber = $lastNumber + 1;
        } else {
            $nextNumber = 1;
        }

        return $prefix . str_pad((string) $nextNumber, 6, '0', STR_PAD_LEFT);
    }
}
