<?php declare(strict_types=1);

namespace App\GraphQL\Mutations\Barangay;

use App\Models\BarangaySetting;
use Illuminate\Support\Facades\DB;

final readonly class DeleteBarangaySetting
{
    public function __invoke(null $_, array $args): bool
    {
        return DB::transaction(function () {
            $setting = BarangaySetting::first();
            if ($setting) {
                $setting->delete();
                return true;
            }
            return false;
        });
    }
}
