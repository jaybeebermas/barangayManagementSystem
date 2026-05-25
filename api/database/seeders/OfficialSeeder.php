<?php

namespace Database\Seeders;

use App\Models\Official;
use Illuminate\Database\Seeder;

class OfficialSeeder extends Seeder
{
    public function run(): void
    {
        $officials = [
            // BARANGAY OFFICIALS
            [
                'name' => 'Hon. Juan Dela Cruz',
                'position' => 'Barangay Captain',
                'type' => 'BARANGAY',
                'email' => 'juan.delacruz@brgysync.gov.ph',
                'contact_number' => '09171234567',
                'term_start' => '2023-11-30',
                'term_end' => '2025-11-30',
                'status' => true,
            ],
            [
                'name' => 'Hon. Maria Santos',
                'position' => 'Councilor (Kagawad)',
                'type' => 'BARANGAY',
                'email' => 'maria.santos@brgysync.gov.ph',
                'contact_number' => '09187654321',
                'term_start' => '2023-11-30',
                'term_end' => '2025-11-30',
                'status' => true,
            ],
            [
                'name' => 'Hon. Pedro Penduko',
                'position' => 'Councilor (Kagawad)',
                'type' => 'BARANGAY',
                'email' => 'pedro.penduko@brgysync.gov.ph',
                'contact_number' => '09199876543',
                'term_start' => '2023-11-30',
                'term_end' => '2025-11-30',
                'status' => true,
            ],
            [
                'name' => 'Hon. Ana Reyes',
                'position' => 'Secretary',
                'type' => 'BARANGAY',
                'email' => 'ana.reyes@brgysync.gov.ph',
                'contact_number' => '09201112223',
                'term_start' => '2023-11-30',
                'term_end' => '2025-11-30',
                'status' => true,
            ],
            [
                'name' => 'Hon. Jose Garcia',
                'position' => 'Treasurer',
                'type' => 'BARANGAY',
                'email' => 'jose.garcia@brgysync.gov.ph',
                'contact_number' => '09213334445',
                'term_start' => '2023-11-30',
                'term_end' => '2025-11-30',
                'status' => true,
            ],

            // SK MEMBERS
            [
                'name' => 'Hon. Mark Perez',
                'position' => 'SK Chairperson',
                'type' => 'SK',
                'email' => 'mark.perez@brgysync.gov.ph',
                'contact_number' => '09304445556',
                'term_start' => '2023-11-30',
                'term_end' => '2025-11-30',
                'status' => true,
            ],
            [
                'name' => 'Hon. Sarah Geronimo',
                'position' => 'SK Councilor',
                'type' => 'SK',
                'email' => 'sarah.g@brgysync.gov.ph',
                'contact_number' => '09315556667',
                'term_start' => '2023-11-30',
                'term_end' => '2025-11-30',
                'status' => true,
            ],
            [
                'name' => 'Hon. James Reid',
                'position' => 'SK Secretary',
                'type' => 'SK',
                'email' => 'james.reid@brgysync.gov.ph',
                'contact_number' => '09327778889',
                'term_start' => '2023-11-30',
                'term_end' => '2025-11-30',
                'status' => true,
            ],
        ];

        foreach ($officials as $official) {
            Official::updateOrCreate(
                ['name' => $official['name'], 'position' => $official['position']],
                $official
            );
        }
    }
}
