<?php declare(strict_types=1);

namespace App\GraphQL\Mutations\Barangay;

use App\Models\BarangaySetting;
use Illuminate\Support\Facades\DB;

final readonly class UpdateBarangaySetting
{
    public function __invoke(null $_, array $args): BarangaySetting
    {
        DB::beginTransaction();

        try {
            $input = $args['input'] ?? $args;
            $setting = BarangaySetting::firstOrFail();
            $setting->update($input);
            
            DB::commit();
            return $setting;
            
        } catch (\Exception $e) {
            DB::rollBack();
            \Illuminate\Support\Facades\Log::error('Failed to update Barangay Setting.', [
                'error' => $e->getMessage(),
                'args' => $args
            ]);
            throw $e;
        }
    }
}
