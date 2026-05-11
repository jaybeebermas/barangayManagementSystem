<?php

namespace App\GraphQL\Mutations;

use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserMutation
{
    public function createUser(mixed $_, array $args): User
    {
        $input = $args['input'];
        
        $user = User::create([
            'username' => $input['username'],
            'first_name' => $input['first_name'],
            'last_name' => $input['last_name'],
            'email' => $input['email'],
            'password' => $input['password'],
            'role' => $input['role'],
        ]);

        $user->assignRole($input['role']);

        return $user;
    }

    public function updateUser(mixed $_, array $args): User
    {
        $input = $args['input'];
        $user = User::findOrFail($input['id']);

        $updateData = collect($input)->only(['username', 'first_name', 'last_name', 'email', 'role'])->toArray();
        
        if (isset($input['password']) && !empty($input['password'])) {
            $updateData['password'] = $input['password'];
        }

        $user->update($updateData);

        if (isset($input['role'])) {
            $user->syncRoles([$input['role']]);
        }

        return $user;
    }
}
