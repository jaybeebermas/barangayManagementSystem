<?php declare(strict_types=1);

namespace App\GraphQL\Mutations\Residence\Zone;

use App\Models\Zone;

final readonly class CreateZone
{
    public function __invoke(null $_, array $args)
    {
        $input = $args['input'] ?? $args;
        return Zone::create($input);
    }
}
