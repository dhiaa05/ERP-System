<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            AdminUserSeeder::class,
            WilayaSeeder::class,
            CommuneSeeder::class,
            ExpenseCategorySeeder::class,
            SettingSeeder::class,
            AlertThresholdSeeder::class,
            SyncSourceSeeder::class,
        ]);
    }
}
