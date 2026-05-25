<?php declare(strict_types=1);

namespace App\GraphQL\Mutations\Event;

use App\Models\Event;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

final readonly class CreateEvent
{
    public function __invoke(null $_, array $args): Event
    {
        DB::beginTransaction();

        try {
            $event = Event::create($args['input']);
            
            DB::commit();
            return $event;
            
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to create Event.', [
                'error' => $e->getMessage(),
                'args' => $args
            ]);
            throw $e;
        }
    }
}
