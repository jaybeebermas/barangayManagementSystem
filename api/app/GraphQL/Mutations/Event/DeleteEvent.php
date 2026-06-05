<?php declare(strict_types=1);

namespace App\GraphQL\Mutations\Event;

use App\Models\Event;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

final readonly class DeleteEvent
{
    public function __invoke(null $_, array $args): bool
    {
        DB::beginTransaction();

        try {
            $event = Event::findOrFail($args['id']);
            $event->delete();
            
            DB::commit();
            return true;
            
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to delete Event.', [
                'error' => $e->getMessage(),
                'args' => $args
            ]);
            throw $e;
        }
    }
}
