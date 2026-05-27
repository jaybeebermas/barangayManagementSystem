<?php declare(strict_types=1);

namespace App\GraphQL\Mutations\DocumentModule\BarangayClearance;

use App\Models\BarangayClearance;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Throwable;

final readonly class CreateClearance
{
    public function __invoke(null $_, array $args): BarangayClearance
    {
        DB::beginTransaction();

        try {
            $input = $args['input'] ?? $args;

            // Auto-generate clearance number
            $input['clearance_number'] = BarangayClearance::generateClearanceNumber();

            // Set issued_by to current authenticated user
            $input['issued_by'] = Auth::id();

            // Default status to pending if not provided
            if (empty($input['status'])) {
                $input['status'] = 'pending';
            }

            $clearance = BarangayClearance::create($input);

            DB::commit();
            Log::info('CreateBarangayClearance mutation succeeded.', [
                'clearance_id' => $clearance->id,
                'clearance_number' => $clearance->clearance_number,
                'resident_id' => $clearance->resident_id,
                'issued_by' => $clearance->issued_by,
            ]);

            return $clearance->load(['resident', 'issuer']);
        } catch (Throwable $e) {
            DB::rollBack();

            Log::error('CreateBarangayClearance mutation failed.', [
                'input' => $args['input'] ?? $args,
                'error' => $e->getMessage(),
            ]);

            throw $e;
        }
    }
}
