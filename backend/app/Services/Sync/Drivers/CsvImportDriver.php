<?php

namespace App\Services\Sync\Drivers;

use App\Models\SyncSource;
use App\Services\Sync\Contracts\SyncDriverInterface;
use Illuminate\Support\Collection;
use RuntimeException;

class CsvImportDriver implements SyncDriverInterface
{
    /**
     * Parses a CSV file and maps each row to an associative array using the header row.
     */
    public function fetch(SyncSource $source, array $options = []): Collection
    {
        $filePath = $options['file_path'] ?? null;
        
        if (!$filePath || !file_exists($filePath)) {
            throw new RuntimeException("CSV file path is missing or invalid.");
        }

        $rows = [];
        if (($handle = fopen($filePath, "r")) !== false) {
            // Read headers
            $headers = fgetcsv($handle, 0, ",");
            if (!$headers) {
                throw new RuntimeException("Invalid CSV format: Missing headers.");
            }
            
            // Clean headers (trim whitespace)
            $headers = array_map('trim', $headers);

            // Read rows
            while (($data = fgetcsv($handle, 0, ",")) !== false) {
                if (count($headers) === count($data)) {
                    $rows[] = array_combine($headers, $data);
                } else {
                    // Handle misaligned rows (could be logged as warnings)
                    // For MVP, we skip strictly misaligned rows.
                }
            }
            fclose($handle);
        }

        return collect($rows);
    }
}
