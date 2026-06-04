<?php declare(strict_types=1);

namespace App\GraphQL\Mutations\Barangay;

use App\Models\BarangaySetting;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

final readonly class UpdateBarangaySetting
{
    public function __invoke(null $_, array $args): BarangaySetting
    {
        DB::beginTransaction();

        try {
            $input = $args['input'] ?? $args;
            $setting = BarangaySetting::firstOrFail();

            if (isset($input['base64_logo']) && !empty($input['base64_logo'])) {
                // Decode the base64 string
                $imageParts = explode(";base64,", $input['base64_logo']);
                $imageTypeAux = explode("image/", $imageParts[0]);
                $imageType = $imageTypeAux[1];
                $imageBase64 = base64_decode($imageParts[1]);

                // Generate unique filename
                $fileName = 'logo_' . time() . '_' . Str::random(5) . '.' . $imageType;
                $filePath = 'logos/' . $fileName;
                Storage::disk('public')->put($filePath, $imageBase64);

                // Save the path to the database
                $input['logo_path'] = $filePath;
            }
            
            // Remove base64_logo so it doesn't crash the database update
            unset($input['base64_logo']);

            $setting->update($input);
            
            DB::commit();
            return $setting;
            
        } catch (\Exception $e) {
            DB::rollBack();
            \Illuminate\Support\Facades\Log::error('Failed to update Barangay Setting.', [
                'error' => $e->getMessage()
            ]);
            throw $e;
        }
    }
}
