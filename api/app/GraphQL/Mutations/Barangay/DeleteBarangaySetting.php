<?php declare(strict_types=1);

namespace App\GraphQL\Mutations\Barangay;

use App\Models\BarangaySetting;

final readonly class DeleteBarangaySetting
{
    public function __invoke(null $_, array $args): bool
    {
        $setting = BarangaySetting::first();
        if ($setting) {
            $setting->delete();
            return true;
        }
        return false;
    }
}
