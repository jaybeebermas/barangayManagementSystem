<?php declare(strict_types=1);

namespace App\GraphQL\Mutations\Barangay;

use App\Models\BarangaySetting;
use Illuminate\Support\Facades\DB;

final readonly class DeleteBarangaySetting
{
    public function __invoke(null $_, array $args): bool
    {
        DB::beginTransaction();

        try {
            $setting = BarangaySetting::first();
            if ($setting) {
                $setting->delete();
                DB::commit();
                return true;
            }
            
            DB::commit();
            return false;
            
        } catch (\Exception $e) {
            DB::rollBack();
            \Illuminate\Support\Facades\Log::error('Failed to delete Barangay Setting.', [
                'error' => $e->getMessage(),
                'args' => $args
            ]);
            throw $e;
        }
    }
}
