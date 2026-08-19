<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\SyncSource;
use App\Services\Sync\Drivers\CsvImportDriver;
use App\Services\Sync\Mappers\ColumnMapper;
use App\Services\Sync\Mappers\StatusMapper;
use App\Services\Sync\Resolvers\EntityResolverService;
use App\Services\Sync\SheetSyncService;
use Illuminate\Http\Request;

class SyncController extends Controller
{
    /**
     * Get recent sync logs
     */
    public function index()
    {
        $logs = \App\Models\SyncLog::with('syncSource')
            ->latest('started_at')
            ->take(50)
            ->get();
            
        return response()->json($logs);
    }

    /**
     * Upload and sync a CSV file for a given sync source.
     */
    public function uploadCsv(Request $request, SyncSource $source)
    {
        $request->validate([
            'file' => 'required|file|mimes:csv,txt|max:10240', // 10MB max
        ]);

        $file = $request->file('file');
        $path = $file->storeAs('sync-uploads', time() . '_' . $file->getClientOriginalName());

        // In a real app, we might dispatch a Job to run this asynchronously.
        // For MVP, we run synchronously to return immediate feedback.
        
        // Assemble pipeline dependencies
        $driver = new CsvImportDriver();
        $columnMapper = new ColumnMapper();
        $statusMapper = new StatusMapper();
        $resolver = new EntityResolverService();

        $syncService = new SheetSyncService($driver, $columnMapper, $statusMapper, $resolver);

        try {
            $stats = $syncService->sync($source, [
                'file_path' => storage_path('app/' . $path)
            ]);

            return response()->json([
                'message' => 'Sychronization completed successfully.',
                'stats' => $stats
            ]);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error("Sync Error: " . $e->getMessage() . "\n" . $e->getTraceAsString());
            return response()->json([
                'message' => 'Sychronization failed.',
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ], 500);
        }
    }
}
