<?php declare(strict_types=1);

namespace App\GraphQL\Mutations\Role;

use App\Models\Role;

final readonly class DeleteRole
{
    /** @param  array{id: string}  $args */
    public function __invoke(null $_, array $args): ?Role
    {
        $role = Role::query()->find($args['id']);
        if (! $role) {
            return null;
        }

        $role->delete();

        return $role;
    }
}
