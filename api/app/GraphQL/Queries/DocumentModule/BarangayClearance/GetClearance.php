<?php declare(strict_types=1);

namespace App\GraphQL\Queries\DocumentModule\BarangayClearance;

use App\Models\BarangayClearance;

final readonly class GetClearance
{
    public function barangayClearances(null $_, array $args)
    {
        return BarangayClearance::with(['resident', 'issuer'])->orderByDesc('created_at')->get();
    }

    public function barangayClearance(null $_, array $args)
    {
        return BarangayClearance::with(['resident', 'issuer'])->find($args['id']);
    }
}
