<?php declare(strict_types=1);

namespace App\GraphQL\Mutations\Barangay;

use App\Models\BarangaySetting;

final readonly class CreateBarangaySetting
{
    public function __invoke(null $_, array $args): BarangaySetting
    {
        $input = $args['input'] ?? $args;
        
        $setting = BarangaySetting::first();
        if ($setting) {
            $setting->update($input);
        } else {
            $setting = BarangaySetting::create($input);
        }
        return $setting;
    }
}
