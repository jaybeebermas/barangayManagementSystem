<?php declare(strict_types=1);

namespace App\GraphQL\Mutations\Zone;

use App\Models\Zone;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Throwable;

final readonly class CreateZone
{
    public function __invoke(null $_, array $args): Zone
    {
        DB::beginTransaction();

        try {
            $input = $args['input'] ?? $args;
            $zone = Zone::create($input);

            DB::commit();
            Log::info('CreateZone mutation succeeded.', [
                'zone_id' => $zone->id,
                'zone_code' => $zone->zone_code,
            ]);

            return $zone;
        } catch (Throwable $e) {
            DB::rollBack();

            Log::error('CreateZone mutation failed.', [
                'input' => $args['input'] ?? $args,
                'error' => $e->getMessage(),
            ]);

            throw $e;
        }
    }
}
