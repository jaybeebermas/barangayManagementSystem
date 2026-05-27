<?php declare(strict_types=1);

namespace App\GraphQL\Mutations\Event;

use App\Models\Event;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

final readonly class UpdateEvent
{
    public function __invoke(null $_, array $args): Event
    {
        DB::beginTransaction();

        try {
            $input = $args['input'];
            $event = Event::findOrFail($input['id']);
            $event->update($input);
            
            DB::commit();
            return $event;
            
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to update Event.', [
                'error' => $e->getMessage(),
                'args' => $args
            ]);
            throw $e;
        }
    }
}
