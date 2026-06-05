<?php declare(strict_types=1);

namespace App\GraphQL\Mutations\DocumentModule\BarangayClearance;

use App\Models\BarangayClearance;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Throwable;

final readonly class UpdateClearance
{
    public function __invoke(null $_, array $args): BarangayClearance
    {
        DB::beginTransaction();

        try {
            $input = $args['input'] ?? $args;
            $clearance = BarangayClearance::findOrFail($input['id']);

            // Only allow updating purpose, valid_until, and status
            $updateData = array_intersect_key($input, array_flip([
                'purpose', 'valid_until', 'status',
            ]));

            $clearance->update($updateData);

            DB::commit();
            Log::info('UpdateBarangayClearance mutation succeeded.', [
                'clearance_id' => $clearance->id,
                'clearance_number' => $clearance->clearance_number,
            ]);

            return $clearance->load(['resident', 'issuer']);
        } catch (Throwable $e) {
            DB::rollBack();

            Log::error('UpdateBarangayClearance mutation failed.', [
                'input' => $args['input'] ?? $args,
                'error' => $e->getMessage(),
            ]);

            throw $e;
        }
    }
}
