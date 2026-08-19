<?php

namespace App\Services\Sync\Mappers;

use App\Models\SyncSource;
use Illuminate\Support\Collection;

class ColumnMapper
{
    /**
     * Maps raw external row data to internal schema keys.
     *
     * @param SyncSource $source
     * @param array $rawRow
     * @return array
     */
    public function mapRow(SyncSource $source, array $rawRow): array
    {
        // MVP uses static fallbacks instead of database mapping to simplify setup
        $mappingsCache = [];
        $mappings = [];
        $mappedRow = [];

        // E.g., $rawRow = ['Nom et Prenom' => 'John Doe', 'Telephone' => '0555']
        // $mappings = ['Nom et Prenom' => 'customer_name', 'Telephone' => 'customer_phone']
        foreach ($rawRow as $sheetColumnName => $value) {
            $sheetColumnName = trim($sheetColumnName);
            
            if (isset($mappings[$sheetColumnName])) {
                $internalField = $mappings[$sheetColumnName];
                $mappedRow[$internalField] = is_string($value) ? trim($value) : $value;
            }
        }

        // Store original raw data for audit/logs
        $mappedRow['_raw_data'] = json_encode($rawRow, JSON_UNESCAPED_UNICODE);

        // Fallbacks for common unmapped columns based on headers
        $commonFallbacks = [
            'Created At' => 'ordered_at',
            'Date' => 'ordered_at',
            'Sent At' => 'ordered_at',
            'Name' => 'customer_name',
            'Nom' => 'customer_name',
            'Username' => 'customer_name',
            'Confirmatrice' => 'confirmatrice_name',
            'confirmedby' => 'confirmatrice_name',
            
            'Phone' => 'customer_phone',
            'Telephone' => 'customer_phone',
            
            'Wilaya' => 'customer_state',
            'State' => 'customer_state',
            
            'Commune' => 'customer_city',
            'City' => 'customer_city',
            
            'Product' => 'product_name',
            'Produit' => 'product_name',
            'Product Name' => 'product_name',
            
            'Qty' => 'quantity',
            'Quantite' => 'quantity',
            'Quantity' => 'quantity',
            
            'Price' => 'unit_price',
            'Prix' => 'unit_price',
            
            'Total' => 'total_amount',
            
            'Shipping Price' => 'shipping_fee',
            'ShippingTo?' => 'shipping_type',
            
            'SKU' => 'sku',
            
            'Status' => 'status',
            'Remarque' => 'notes',
            'Reference' => 'external_reference',
            'Tracking' => 'tracking_number',
        ];

        foreach ($rawRow as $sheetColumnName => $value) {
            $sheetColumnName = trim($sheetColumnName);
            if (!isset($mappedRow[$sheetColumnName]) && isset($commonFallbacks[$sheetColumnName])) {
                $internalField = $commonFallbacks[$sheetColumnName];
                
                // Do not overwrite an existing non-empty value with another value (e.g. if 'Created At' already set 'ordered_at', don't let 'Sent At' overwrite it)
                if (!empty($mappedRow[$internalField]) && !empty($value)) {
                    continue;
                }

                if (!isset($mappedRow[$internalField]) || empty($mappedRow[$internalField])) {
                    $mappedRow[$internalField] = is_string($value) ? trim($value) : $value;
                }
            }
        }

        return $mappedRow;
    }
}
