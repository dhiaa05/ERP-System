<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$cat = App\Models\Category::firstOrCreate(['slug' => 'general'], ['name' => 'Général']);
echo "CATEGORY_ID=" . $cat->id . "\n";
