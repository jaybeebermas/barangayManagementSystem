<?php declare(strict_types=1);

namespace App\GraphQL\Mutations\Official;

use App\Models\Official;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

final readonly class UpdateOfficial
{
    public function __invoke(null $_, array $args): Official
    {
        DB::beginTransaction();
        try {
            $input = $args['input'];
            $official = Official::findOrFail($input['id']);
            $official->update($input);
            DB::commit();
            return $official;
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to update Official.', ['error' => $e->getMessage()]);
            throw $e;
        }
    }
}
