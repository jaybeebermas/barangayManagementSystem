<?php

namespace App\GraphQL\Queries;

use App\Models\User;
use Illuminate\Support\Facades\Log;

class UserQuery
{
    public function users(): \Illuminate\Database\Eloquent\Collection
    {
        $users = User::all();
        Log::info('Users Query found ' . $users->count() . ' users.');
        return $users;
    }
}
