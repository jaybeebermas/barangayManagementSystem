<?php declare(strict_types=1);

namespace App\GraphQL\Queries\Barangay;

use App\Models\BarangaySetting;

final readonly class GetBarangaySetting
{
    public function __invoke(null $_, array $args): ?BarangaySetting
    {
        return BarangaySetting::first();
    }
}
