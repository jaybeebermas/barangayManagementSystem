<?php declare(strict_types=1);

namespace App\GraphQL\Mutations\Zone;

use App\Models\Zone;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Throwable;

final readonly class UpdateZone
{
    public function __invoke(null $_, array $args): Zone
    {
        DB::beginTransaction();

        try {
            $input = $args['input'] ?? $args;
            $zone = Zone::findOrFail($input['id']);
            $zone->update($input);

            DB::commit();
            Log::info('UpdateZone mutation succeeded.', [
                'zone_id' => $zone->id,
            ]);

            return $zone;
        } catch (Throwable $e) {
            DB::rollBack();

            Log::error('UpdateZone mutation failed.', [
                'input' => $args['input'] ?? $args,
                'error' => $e->getMessage(),
            ]);

            throw $e;
        }
    }
}
