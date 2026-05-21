<?php declare(strict_types=1);

namespace App\GraphQL\Queries\Zone;

use App\Models\Zone;

final readonly class GetZone
{
    public function zones(null $_, array $args)
    {
        return Zone::all();
    }

    public function zone(null $_, array $args)
    {
        return Zone::find($args['id']);
    }
}
