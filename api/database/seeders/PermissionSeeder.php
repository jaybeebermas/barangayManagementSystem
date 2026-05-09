<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class PermissionSeeder extends Seeder
{
    /**
     * Seed the application's permissions from config/const.php.
     */
    public function run(): void
    {
        $permissionModelClass = config('permission.models.permission');
        $guardName = config('auth.defaults.guard', 'web');
        $permissions = config('const.permissions', []);

        foreach ($permissions as $permissionName) {
            $permissionModelClass::query()->updateOrCreate(
                ['name' => $permissionName, 'guard_name' => $guardName],
                []
            );
        }

        $permissionRegistrar = app()->bound('permission.registrar')
            ? app('permission.registrar')
            : null;

        if ($permissionRegistrar && method_exists($permissionRegistrar, 'forgetCachedPermissions')) {
            $permissionRegistrar->forgetCachedPermissions();
        }
    }
}
