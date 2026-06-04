<?php declare(strict_types=1);

namespace App\GraphQL\Mutations\DocumentModule\BarangayClearance;

use App\Models\BarangayClearance;
use App\Models\BarangaySetting;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Throwable;

final readonly class GenerateClearancePdf
{
    public function __invoke(null $_, array $args): string
    {
        try {
            $clearance = BarangayClearance::with(['resident', 'issuer'])->findOrFail($args['id']);
            $settings = BarangaySetting::first();

            $data = [
                'clearance' => $clearance,
                'resident' => $clearance->resident,
                'issuer' => $clearance->issuer,
                'settings' => $settings,
            ];

            $pdf = Pdf::loadView('pdf.barangay-clearance', $data)
                ->setPaper('letter', 'portrait');

            $timestamp = time();
            $fileName = "clearance_{$clearance->clearance_number}_{$timestamp}.pdf";
            $filePath = "clearances/{$fileName}";

            Storage::disk('public')->put($filePath, $pdf->output());

            $url = Storage::disk('public')->url($filePath);

            Log::info('GenerateBarangayClearancePdf succeeded.', [
                'clearance_id' => $clearance->id,
                'clearance_number' => $clearance->clearance_number,
                'file_path' => $filePath,
            ]);

            return $url;
        } catch (Throwable $e) {
            Log::error('GenerateBarangayClearancePdf failed.', [
                'id' => $args['id'] ?? null,
                'error' => $e->getMessage(),
            ]);

            throw $e;
        }
    }
}
