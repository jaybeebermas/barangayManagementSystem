<?php declare(strict_types=1);

namespace App\GraphQL\Queries\ResidentProfile;

use App\Models\ResidentProfile;

final readonly class GetResidentProfile
{
    public function residentProfiles(null $_, array $args)
    {
        return ResidentProfile::all();
    }

    public function residentProfile(null $_, array $args)
    {
        return ResidentProfile::find($args['id']);
    }
}
