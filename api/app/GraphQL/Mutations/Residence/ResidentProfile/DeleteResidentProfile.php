<?php declare(strict_types=1);

namespace App\GraphQL\Mutations\Residence\ResidentProfile;

use App\Models\ResidentProfile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Throwable;

final readonly class DeleteResidentProfile
{
    public function __invoke(null $_, array $args): ResidentProfile
    {
        DB::beginTransaction();

        try {
            $residentProfile = ResidentProfile::findOrFail($args['id']);
            $residentProfile->delete();

            DB::commit();
            Log::info('DeleteResidentProfile mutation succeeded.', [
                'resident_profile_id' => $args['id'],
            ]);

            return $residentProfile;
        } catch (Throwable $e) {
            DB::rollBack();

            Log::error('DeleteResidentProfile mutation failed.', [
                'id' => $args['id'] ?? null,
                'error' => $e->getMessage(),
            ]);

            throw $e;
        }
    }
}
