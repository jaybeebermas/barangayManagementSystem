<?php declare(strict_types=1);

namespace App\GraphQL\Mutations\Footer;

use App\Models\Footer;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Throwable;

final readonly class DeleteFooter
{
    public function __invoke(null $_, array $args): Footer
    {
        DB::beginTransaction();
        try {
            $footer = Footer::findOrFail($args['id']);
            $footer->delete();
            DB::commit();
            Log::info('DeleteFooter mutation succeeded.', ['footer_id' => $args['id']]);
            return $footer;
        } catch (Throwable $e) {
            DB::rollBack();
            Log::error('DeleteFooter mutation failed.', ['error' => $e->getMessage()]);
            throw $e;
        }
    }
}
