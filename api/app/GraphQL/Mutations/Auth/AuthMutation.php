<?php

namespace App\GraphQL\Mutations\Auth;

use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;

class AuthMutation
{
    /**
     * @param  mixed  $_
     * @param  array{username: string, password: string}  $args
     * @return array{status: string, message: string, token?: string, user?: User}
     */
    public function login(mixed $_, array $args): array
    {
        $throttleKey = strtolower($args['username']).'|'.request()->ip();

        if (RateLimiter::tooManyAttempts($throttleKey, 5)) {
            return [
                'status' => 'ERROR',
                'message' => 'Too many login attempts. Please try again in '.RateLimiter::availableIn($throttleKey).' seconds.',
            ];
        }

        $user = User::where('username', $args['username'])->first();

        if (! $user || ! Hash::check($args['password'], $user->password)) {
            RateLimiter::hit($throttleKey);
            return [
                'status' => 'ERROR',
                'message' => 'Invalid credentials.',
            ];
        }

        RateLimiter::clear($throttleKey);

        Auth::guard('web')->login($user);
        $token = $user->createToken('auth_token')->plainTextToken;

        return [
            'status' => 'SUCCESS',
            'message' => 'Login successful.',
            'token' => $token,
            'user' => $user,
        ];
    }

    /**
     * @param  mixed  $_
     * @param  array{username: string, first_name: string, last_name: string, email: string, password: string}  $args
     * @return array{status: string, message: string, token?: string, user?: User}
     */
    public function register(mixed $_, array $args): array
    {
        if (User::where('username', $args['username'])->exists()) {
            return [
                'status' => 'ERROR',
                'message' => 'Username already taken.',
            ];
        }

        if (User::where('email', $args['email'])->exists()) {
            return [
                'status' => 'ERROR',
                'message' => 'Email already registered.',
            ];
        }

        $user = User::create([
            'username' => $args['username'],
            'first_name' => $args['first_name'],
            'last_name' => $args['last_name'],
            'email' => $args['email'],
            'password' => Hash::make($args['password']),
        ]);

        $user->assignRole('admin');

        Auth::guard('web')->login($user);
        $token = $user->createToken('auth_token')->plainTextToken;

        return [
            'status' => 'SUCCESS',
            'message' => 'Registration successful.',
            'token' => $token,
            'user' => $user,
        ];
    }

    /**
     * @return array{status: string, message: string}
     */
    public function logout(): array
    {
        $user = Auth::user();
        if ($user instanceof User) {
            $user->tokens()->delete();
        }

        return [
            'status' => 'SUCCESS',
            'message' => 'Logged out successfully.',
        ];
    }

    /**
     * @return User|null
     */
    public function me(): ?User
    {
        $user = Auth::user();

        return $user instanceof User ? $user : null;
    }
}
