<?php declare(strict_types=1);

namespace App\GraphQL\Mutations\Zone;

use App\Models\Zone;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Throwable;

final readonly class DeleteZone
{
    public function __invoke(null $_, array $args): Zone
    {
        DB::beginTransaction();

        try {
            $zone = Zone::findOrFail($args['id']);
            $zone->delete();

            DB::commit();
            Log::info('DeleteZone mutation succeeded.', [
                'zone_id' => $args['id'],
            ]);

            return $zone;
        } catch (Throwable $e) {
            DB::rollBack();

            Log::error('DeleteZone mutation failed.', [
                'id' => $args['id'] ?? null,
                'error' => $e->getMessage(),
            ]);

            throw $e;
        }
    }
}
