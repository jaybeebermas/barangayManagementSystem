<?php

namespace App\GraphQL\Mutations\Auth;

use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\RateLimiter;
use Throwable;

class AuthMutation
{
    /**
     * @param  mixed  $_
     * @param  array{username: string, password: string}  $args
     * @return array{status: string, message: string, token?: string, user?: User}
     */
    public function login(mixed $_, array $args): array
    {
        DB::beginTransaction();

        $throttleKey = strtolower($args['username']).'|'.request()->ip();

        try {
            if (RateLimiter::tooManyAttempts($throttleKey, 5)) {
                DB::commit();
                Log::warning('Login mutation blocked by rate limiter.', [
                    'username' => $args['username'] ?? null,
                    'ip' => request()->ip(),
                ]);

                return [
                    'status' => 'ERROR',
                    'message' => 'Too many login attempts. Please try again in '.RateLimiter::availableIn($throttleKey).' seconds.',
                ];
            }

            $user = User::where('username', $args['username'])->first();

            if (! $user || ! Hash::check($args['password'], $user->password)) {
                RateLimiter::hit($throttleKey);
                DB::commit();
                Log::warning('Login mutation failed. Invalid credentials.', [
                    'username' => $args['username'] ?? null,
                    'ip' => request()->ip(),
                ]);

                return [
                    'status' => 'ERROR',
                    'message' => 'Invalid credentials.',
                ];
            }

            RateLimiter::clear($throttleKey);

            Auth::guard('web')->login($user);
            $token = $user->createToken('auth_token')->plainTextToken;

            DB::commit();
            Log::info('Login mutation succeeded.', [
                'user_id' => $user->id,
            ]);

            return [
                'status' => 'SUCCESS',
                'message' => 'Login successful.',
                'token' => $token,
                'user' => $user,
            ];
        } catch (Throwable $e) {
            DB::rollBack();
            Log::error('Login mutation failed with exception.', [
                'username' => $args['username'] ?? null,
                'error' => $e->getMessage(),
            ]);

            throw $e;
        }
    }

    /**
     * @param  mixed  $_
     * @param  array{username: string, first_name: string, last_name: string, email: string, password: string}  $args
     * @return array{status: string, message: string, token?: string, user?: User}
     */
    public function register(mixed $_, array $args): array
    {
        DB::beginTransaction();

        try {
            if (User::where('username', $args['username'])->exists()) {
                DB::commit();
                Log::warning('Register mutation blocked. Username already taken.', [
                    'username' => $args['username'] ?? null,
                ]);

                return [
                    'status' => 'ERROR',
                    'message' => 'Username already taken.',
                ];
            }

            if (User::where('email', $args['email'])->exists()) {
                DB::commit();
                Log::warning('Register mutation blocked. Email already registered.', [
                    'email' => $args['email'] ?? null,
                ]);

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

            DB::commit();
            Log::info('Register mutation succeeded.', [
                'user_id' => $user->id,
                'username' => $user->username,
            ]);

            return [
                'status' => 'SUCCESS',
                'message' => 'Registration successful.',
                'token' => $token,
                'user' => $user,
            ];
        } catch (Throwable $e) {
            DB::rollBack();
            Log::error('Register mutation failed with exception.', [
                'username' => $args['username'] ?? null,
                'email' => $args['email'] ?? null,
                'error' => $e->getMessage(),
            ]);

            throw $e;
        }
    }

    /**
     * @return array{status: string, message: string}
     */
    public function logout(): array
    {
        DB::beginTransaction();

        try {
            $user = Auth::user();
            if ($user instanceof User) {
                $user->tokens()->delete();
            }

            DB::commit();
            Log::info('Logout mutation succeeded.', [
                'user_id' => $user instanceof User ? $user->id : null,
            ]);

            return [
                'status' => 'SUCCESS',
                'message' => 'Logged out successfully.',
            ];
        } catch (Throwable $e) {
            DB::rollBack();
            Log::error('Logout mutation failed with exception.', [
                'error' => $e->getMessage(),
            ]);

            throw $e;
        }
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
