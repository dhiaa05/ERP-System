<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        User::firstOrCreate(
            ['email' => 'admin@lamsti.dz'],
            [
                'name'     => 'Admin',
                'password' => Hash::make('lamsti2026!'),
                'role'     => 'admin',
                'is_active' => true,
            ]
        );
    }
}
