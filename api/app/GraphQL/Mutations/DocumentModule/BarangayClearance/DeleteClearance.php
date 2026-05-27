<?php declare(strict_types=1);

namespace App\GraphQL\Mutations\DocumentModule\BarangayClearance;

use App\Models\BarangayClearance;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Throwable;

final readonly class DeleteClearance
{
    public function __invoke(null $_, array $args): BarangayClearance
    {
        DB::beginTransaction();

        try {
            $clearance = BarangayClearance::with(['resident', 'issuer'])->findOrFail($args['id']);
            $clearance->delete();

            DB::commit();
            Log::info('DeleteBarangayClearance mutation succeeded.', [
                'clearance_id' => $args['id'],
                'clearance_number' => $clearance->clearance_number,
            ]);

            return $clearance;
        } catch (Throwable $e) {
            DB::rollBack();

            Log::error('DeleteBarangayClearance mutation failed.', [
                'id' => $args['id'] ?? null,
                'error' => $e->getMessage(),
            ]);

            throw $e;
        }
    }
}
