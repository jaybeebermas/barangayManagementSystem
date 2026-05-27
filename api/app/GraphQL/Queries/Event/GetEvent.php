<?php declare(strict_types=1);

namespace App\GraphQL\Queries\Event;

use App\Models\Event;

final readonly class GetEvent
{
    public function events(null $_, array $args)
    {
        return Event::query();
    }

    public function event(null $_, array $args)
    {
        return Event::find($args['id']);
    }
}
