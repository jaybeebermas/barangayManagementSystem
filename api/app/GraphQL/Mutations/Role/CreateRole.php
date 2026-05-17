<?php declare(strict_types=1);

namespace App\GraphQL\Mutations\Role;

use App\Models\Role;

final readonly class CreateRole
{
    /** @param  array{input: array{name: string, guard_name?: string}}  $args */
    public function __invoke(null $_, array $args): Role
    {
        $input = $args['input'];

        return Role::query()->create([
            'name' => $input['name'],
            'guard_name' => $input['guard_name'] ?? 'web',
        ]);
    }
}
