<?php declare(strict_types=1);

namespace App\GraphQL\Mutations\User;

use App\Models\User;
use Illuminate\Support\Facades\Hash;

final readonly class CreateUser
{
    /** @param  array{input: array{username: string, first_name: string, last_name: string, email: string, password: string, role?: string}}  $args */
    public function __invoke(null $_, array $args): User
    {
        $input = $args['input'];

        $user = User::create([
            'username' => $input['username'],
            'first_name' => $input['first_name'],
            'last_name' => $input['last_name'],
            'email' => $input['email'],
            'password' => $input['password'], // Laravel 11 'hashed' cast handles this
            'role' => $input['role'] ?? 'user',
        ]);

        if (!empty($input['role'])) {
            $user->assignRole($input['role']);
        }

        return $user;
    }
}
