<?php declare(strict_types=1);

namespace App\GraphQL\Mutations\Barangay;

use App\Models\BarangaySetting;

final readonly class UpdateBarangaySetting
{
    public function __invoke(null $_, array $args): BarangaySetting
    {
        $input = $args['input'] ?? $args;
        $setting = BarangaySetting::firstOrCreate(['id' => 1]);
        $setting->update($input);
        return $setting;
    }
}
