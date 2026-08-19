<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$source = App\Models\SyncSource::first();
$driver = new App\Services\Sync\Drivers\CsvImportDriver();
$mapper = new App\Services\Sync\Mappers\ColumnMapper();
$statusMapper = new App\Services\Sync\Mappers\StatusMapper();
$resolver = new App\Services\Sync\Resolvers\EntityResolverService();
$service = new App\Services\Sync\SheetSyncService($driver, $mapper, $statusMapper, $resolver);

try {
    $stats = $service->sync($source, ['file_path' => storage_path('app/sync-uploads/1784377811_vet B - Com.csv')]);
    dump($stats);
} catch (\Exception $e) {
    echo 'ERROR: ' . $e->getMessage() . "\n" . $e->getFile() . ':' . $e->getLine();
    echo "\nTrace:\n" . $e->getTraceAsString();
}
