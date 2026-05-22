<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            PermissionSeeder::class,
            NavigationSeeder::class,
            AdminSeeder::class,
            UserSeeder::class,
        ]);

        User::query()->firstOrCreate(
            ['username' => 'testuser'],
            [
                'first_name' => 'Test',
                'last_name' => 'User',
                'email' => 'test@example.com',
                'password' => bcrypt('password')
            ]
        );

        \App\Models\BarangaySetting::query()->firstOrCreate(
            ['id' => 1],
            [
                'barangay_name' => 'Barangay San Antonio',
                'municipality' => 'City of Manila',
                'province' => 'Metro Manila',
                'region' => 'NCR',
                'zip_code' => '1000',
                'timezone' => 'Asia/Manila',
                'date_format' => 'MM/DD/YYYY'
            ]
        );
    }
}
