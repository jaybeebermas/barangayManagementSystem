<?php declare(strict_types=1);

namespace App\GraphQL\Queries\Barangay;

use App\Models\BarangaySetting;

final readonly class GetBarangaySetting
{
    public function __invoke(null $_, array $args): BarangaySetting
    {
        return BarangaySetting::firstOrCreate(
            ['id' => 1],
            [
                'barangay_name' => 'Barangay San Antonio',
                'municipality' => 'City of Manila',
                'province' => 'Metro Manila',
                'region' => 'NCR',
                'zip_code' => '1000',
                'timezone' => 'Asia/Manila',
                'date_format' => 'MM/DD/YYYY'
            ]
        );
    }
}
