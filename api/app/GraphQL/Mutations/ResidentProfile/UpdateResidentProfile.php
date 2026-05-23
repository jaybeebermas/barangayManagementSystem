<?php declare(strict_types=1);

namespace App\GraphQL\Mutations\ResidentProfile;

use App\Models\ResidentProfile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Throwable;

final readonly class UpdateResidentProfile
{
    public function __invoke(null $_, array $args): ResidentProfile
    {
        DB::beginTransaction();

        try {
            $input = $args['input'] ?? $args;
            $residentProfile = ResidentProfile::findOrFail($input['id']);
            $residentProfile->update($input);

            DB::commit();
            Log::info('UpdateResidentProfile mutation succeeded.', [
                'resident_profile_id' => $residentProfile->id,
            ]);

            return $residentProfile;
        } catch (Throwable $e) {
            DB::rollBack();

            Log::error('UpdateResidentProfile mutation failed.', [
                'input' => $args['input'] ?? $args,
                'error' => $e->getMessage(),
            ]);

            throw $e;
        }
    }
}
