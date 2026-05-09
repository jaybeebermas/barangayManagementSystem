<?php

namespace App\GraphQL\Mutations;

use Illuminate\Database\Eloquent\Model;

class PermissionMutation
{
    public function createPermission(mixed $_, array $args): Model
    {
        /** @var Model $permissionModel */
        $permissionModel = app('App\\Models\\Permission');

        return $permissionModel->newQuery()->create([
            'name' => $args['input']['name'],
            'guard_name' => $args['input']['guard_name'] ?? 'web',
        ]);
    }

    public function updatePermission(mixed $_, array $args): Model
    {
        /** @var Model $permissionModel */
        $permissionModel = app('App\\Models\\Permission');
        $permission = $permissionModel->newQuery()->findOrFail($args['input']['id']);
        $permission->update([
            'name' => $args['input']['name'],
            'guard_name' => $args['input']['guard_name'] ?? $permission->guard_name,
        ]);

        return $permission->refresh();
    }

    public function deletePermission(mixed $_, array $args): ?Model
    {
        /** @var Model $permissionModel */
        $permissionModel = app('App\\Models\\Permission');
        $permission = $permissionModel->newQuery()->find($args['id']);
        if (! $permission) {
            return null;
        }

        $permission->delete();

        return $permission;
    }
}
