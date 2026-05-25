<?php declare(strict_types=1);

namespace App\GraphQL\Queries\Official;

use App\Models\Official;

final readonly class GetOfficial
{
    public function officials(null $_, array $args): array
    {
        return Official::ofType($args['type'])
            ->orderByRaw("FIELD(position, 'Barangay Captain', 'SK Chairperson', 'Kagawad', 'Secretary', 'Treasurer')")
            ->orderBy('name', 'asc')
            ->get()
            ->toArray();
    }
}
