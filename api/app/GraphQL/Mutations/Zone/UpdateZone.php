<?php declare(strict_types=1);

namespace App\GraphQL\Mutations\Zone;

use App\Models\Zone;

final readonly class UpdateZone
{
    public function __invoke(null $_, array $args)
    {
        $input = $args['input'] ?? $args;
        $zone = Zone::findOrFail($input['id']);
        $zone->update($input);
        return $zone;
    }
}
