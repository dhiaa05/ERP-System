<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ExpenseCategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['name' => 'Support',        'slug' => 'support',        'is_system' => true],
            ['name' => 'Emballage',      'slug' => 'packaging',      'is_system' => true],
            ['name' => 'Impression',     'slug' => 'printing',       'is_system' => true],
            ['name' => 'Internet',       'slug' => 'internet',       'is_system' => true],
            ['name' => 'Flexy',          'slug' => 'flexy',          'is_system' => true],
            ['name' => 'Transport',      'slug' => 'transport',      'is_system' => true],
            ['name' => 'Divers',         'slug' => 'miscellaneous',  'is_system' => false],
        ];

        foreach ($categories as $cat) {
            DB::table('expense_categories')->updateOrInsert(
                ['slug' => $cat['slug']],
                array_merge($cat, [
                    'created_at' => now(),
                    'updated_at' => now(),
                ])
            );
        }
    }
}
