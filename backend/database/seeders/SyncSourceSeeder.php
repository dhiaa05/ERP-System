<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SyncSourceSeeder extends Seeder
{
    public function run(): void
    {
        // Create the default CSV import source
        $sourceId = DB::table('sync_sources')->insertGetId([
            'name'                   => 'Feuille Principale des Commandes',
            'driver'                 => 'csv_import',
            'is_active'              => true,
            'config'                 => json_encode([]),
            'last_sync_status'       => 'never',
            'sync_frequency_minutes' => 30,
            'created_at'             => now(),
            'updated_at'             => now(),
        ]);

        // Column mappings — map sheet headers to internal fields
        $columnMappings = [
            ['sheet_column' => 'Username',    'internal_field' => 'customer_name',    'transform' => null,                'is_required' => true],
            ['sheet_column' => 'Phone',       'internal_field' => 'customer_phone',   'transform' => 'normalize_phone',  'is_required' => true],
            ['sheet_column' => 'State',       'internal_field' => 'wilaya',           'transform' => 'resolve_wilaya',   'is_required' => true],
            ['sheet_column' => 'City',        'internal_field' => 'commune',          'transform' => 'resolve_commune',  'is_required' => false],
            ['sheet_column' => 'SKU',         'internal_field' => 'sku',              'transform' => null,                'is_required' => true],
            ['sheet_column' => 'Quantity',    'internal_field' => 'quantity',         'transform' => 'cast_integer',     'is_required' => true],
            ['sheet_column' => 'Total',       'internal_field' => 'selling_price',    'transform' => 'cast_decimal',     'is_required' => true],
            ['sheet_column' => 'ShippingTo',  'internal_field' => 'customer_shipping','transform' => 'cast_decimal',     'is_required' => false],
            ['sheet_column' => 'Created At',  'internal_field' => 'order_date',       'transform' => 'parse_date',       'is_required' => true],
            ['sheet_column' => 'Remarque',    'internal_field' => 'notes',            'transform' => null,                'is_required' => false],
            // Future: 'Confirmé par' => 'confirmed_by' with transform 'resolve_employee'
        ];

        foreach ($columnMappings as $mapping) {
            DB::table('sync_column_mappings')->insert(array_merge($mapping, [
                'sync_source_id' => $sourceId,
                'default_value'  => null,
                'created_at'     => now(),
                'updated_at'     => now(),
            ]));
        }

        // Status mappings — French and English aliases
        $statusMappings = [
            // Pending
            ['sheet_value' => 'pending',        'internal_status' => 'pending'],
            ['sheet_value' => 'en attente',     'internal_status' => 'pending'],
            ['sheet_value' => '',               'internal_status' => 'pending'],
            ['sheet_value' => 'nouveau',        'internal_status' => 'pending'],
            // Confirmed
            ['sheet_value' => 'confirmed',      'internal_status' => 'confirmed'],
            ['sheet_value' => 'confirmé',       'internal_status' => 'confirmed'],
            ['sheet_value' => 'oui',            'internal_status' => 'confirmed'],
            // Sent
            ['sheet_value' => 'sent',           'internal_status' => 'sent'],
            ['sheet_value' => 'expédié',        'internal_status' => 'sent'],
            ['sheet_value' => 'envoyé',         'internal_status' => 'sent'],
            // Delivered
            ['sheet_value' => 'delivered',      'internal_status' => 'delivered'],
            ['sheet_value' => 'livré',          'internal_status' => 'delivered'],
            ['sheet_value' => 'livraison',      'internal_status' => 'delivered'],
            // Cancelled
            ['sheet_value' => 'cancelled',      'internal_status' => 'cancelled'],
            ['sheet_value' => 'annulé',         'internal_status' => 'cancelled'],
            ['sheet_value' => 'non',            'internal_status' => 'cancelled'],
            // Returned
            ['sheet_value' => 'returned',       'internal_status' => 'returned'],
            ['sheet_value' => 'retourné',       'internal_status' => 'returned'],
            ['sheet_value' => 'retour',         'internal_status' => 'returned'],
            // Refused
            ['sheet_value' => 'refused',        'internal_status' => 'refused'],
            ['sheet_value' => 'refusé',         'internal_status' => 'refused'],
            // Unreachable
            ['sheet_value' => 'unreachable',    'internal_status' => 'unreachable'],
            ['sheet_value' => 'injoignable',    'internal_status' => 'unreachable'],
            ['sheet_value' => 'pas de réponse', 'internal_status' => 'unreachable'],
        ];

        foreach ($statusMappings as $mapping) {
            DB::table('sync_status_mappings')->insert(array_merge($mapping, [
                'sync_source_id' => $sourceId,
                'created_at'     => now(),
                'updated_at'     => now(),
            ]));
        }
    }
}
