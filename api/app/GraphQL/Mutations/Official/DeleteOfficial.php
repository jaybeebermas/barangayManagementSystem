<?php declare(strict_types=1);

namespace App\GraphQL\Mutations\Official;

use App\Models\Official;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

final readonly class DeleteOfficial
{
    public function __invoke(null $_, array $args): bool
    {
        DB::beginTransaction();
        try {
            $official = Official::findOrFail($args['id']);
            $official->delete();
            DB::commit();
            return true;
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to delete Official.', ['error' => $e->getMessage()]);
            throw $e;
        }
    }
}
