<?php declare(strict_types=1);

namespace App\GraphQL\Mutations;

use App\Models\Footer;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Throwable;

final readonly class UpdateFooter
{
    public function __invoke(null $_, array $args): Footer
    {
        DB::beginTransaction();
        try {
            $input = $args['input'] ?? $args;
            $footer = Footer::findOrFail($input['id']);
            $footer->update($input);
            if (isset($input['status']) && $input['status']) {
                Footer::where('id', '!=', $footer->id)->update(['status' => false]);
            }
            DB::commit();
            Log::info('UpdateFooter mutation succeeded.', ['footer_id' => $footer->id]);
            return $footer;
        } catch (Throwable $e) {
            DB::rollBack();
            Log::error('UpdateFooter mutation failed.', ['error' => $e->getMessage()]);
            throw $e;
        }
    }
}
