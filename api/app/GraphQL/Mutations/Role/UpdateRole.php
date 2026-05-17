<?php declare(strict_types=1);

namespace App\GraphQL\Mutations\Role;

use App\Models\Role;

final readonly class UpdateRole
{
    /** @param  array{input: array{id: string, name: string, guard_name?: string}}  $args */
    public function __invoke(null $_, array $args): Role
    {
        $input = $args['input'];
        $role = Role::query()->findOrFail($input['id']);
        $role->update([
            'name' => $input['name'],
            'guard_name' => $input['guard_name'] ?? $role->guard_name,
        ]);

        return $role->refresh();
    }
}
