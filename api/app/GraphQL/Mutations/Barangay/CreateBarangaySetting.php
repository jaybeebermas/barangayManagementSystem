<?php declare(strict_types=1);

namespace App\GraphQL\Mutations\Barangay;

use App\Models\BarangaySetting;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

final readonly class CreateBarangaySetting
{
    public function __invoke(null $_, array $args): BarangaySetting
    {
        DB::beginTransaction();
        
        try {
            $input = $args['input'] ?? $args;
            
            $setting = BarangaySetting::first();
            if ($setting) {
                $setting->update($input);
            } else {
                $setting = BarangaySetting::create($input);
            }
            
            DB::commit();
            
            return $setting;
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to create or update Barangay Setting.', [
                'error' => $e->getMessage(),
                'args' => $args
            ]);
            throw $e;
        }
    }
}
