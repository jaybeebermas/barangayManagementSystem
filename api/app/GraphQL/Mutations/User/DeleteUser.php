<?php declare(strict_types=1);

namespace App\GraphQL\Mutations\User;

use App\Models\User;

final readonly class DeleteUser
{
    /** @param  array{id: string}  $args */
    public function __invoke(null $_, array $args): bool
    {
        $user = User::findOrFail($args['id']);
        return (bool) $user->delete();
    }
}
