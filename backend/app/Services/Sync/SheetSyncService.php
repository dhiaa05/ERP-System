<?php

namespace App\Services\Sync;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\SyncSource;
use App\Models\SyncLog;
use App\Services\Sync\Contracts\SyncDriverInterface;
use App\Services\Sync\Mappers\ColumnMapper;
use App\Services\Sync\Mappers\StatusMapper;
use App\Services\Sync\Resolvers\EntityResolverService;
use Exception;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class SheetSyncService
{
    public function __construct(
        private SyncDriverInterface $driver,
        private ColumnMapper $columnMapper,
        private StatusMapper $statusMapper,
        private EntityResolverService $resolver
    ) {}

    /**
     * Executes the sync process for a given source.
     */
    public function sync(SyncSource $source, array $options = []): array
    {
        $syncLog = SyncLog::create([
            'sync_source_id' => $source->id,
            'started_at'     => now(),
            'status'         => 'running',
            'rows_total' => 0,
            'rows_created'   => 0,
            'rows_updated'   => 0,
            'rows_skipped'   => 0,
            'rows_failed'    => 0,
            'triggered_by'   => 'manual'
        ]);

        $stats = ['processed' => 0, 'created' => 0, 'updated' => 0, 'failed' => 0, 'skipped' => 0];

        try {
            $rawRows = $this->driver->fetch($source, $options);

            foreach ($rawRows as $rawRow) {
                $stats['processed']++;

                try {
                    DB::beginTransaction();

                    $mappedData = $this->columnMapper->mapRow($source, $rawRow);

                    // Skip empty rows
                    if (empty($mappedData['customer_phone']) && empty($mappedData['external_reference'])) {
                        DB::rollBack();
                        $stats['skipped']++;
                        continue;
                    }

                    // 1. Resolve Foreign Keys
                    $wilayaId = $this->resolver->resolveWilaya($mappedData['customer_state'] ?? null) ?? 16; // Default to Alger (16) if not found
                    $communeId = $this->resolver->resolveCommune($mappedData['customer_city'] ?? null, $wilayaId);
                    
                    // 2. Resolve Status
                    $status = $this->statusMapper->mapStatus($source, $mappedData['status'] ?? null);

                    // 3. Find or Create Order
                    $phone = $mappedData['customer_phone'] ?? '';
                    $orderedAt = null;
                    if (!empty($mappedData['ordered_at'])) {
                        $orderedAt = \Carbon\Carbon::parse($mappedData['ordered_at'])->format('Y-m-d H:i:s');
                    }

                    $externalRef = !empty($mappedData['external_reference']) ? trim($mappedData['external_reference']) : null;
                    
                    // Deduplication logic
                    $order = null;
                    $duplicateOfId = null;

                    if ($externalRef) {
                        $order = Order::where('external_reference', $externalRef)->first();
                    } else if ($phone) {
                        // Check if we have an order with the exact same phone and exact same ordered_at
                        if ($orderedAt) {
                            $exactMatch = Order::where('customer_phone', $phone)
                                             ->where('ordered_at', $orderedAt)
                                             ->first();
                            
                            if ($exactMatch) {
                                // This is likely another item in the same order
                                $order = $exactMatch;
                            }
                        }
                        
                        if (!$order) {
                            // Check if we have an older order with this phone (Repeat customer)
                            $previousOrder = Order::where('customer_phone', $phone)->latest('id')->first();
                            if ($previousOrder) {
                                // We will create a NEW order, but mark it as a duplicate/repeat
                                $duplicateOfId = $previousOrder->id;
                            }
                        }
                    }

                    $employeeId = $this->resolver->resolveEmployee($mappedData['confirmatrice_name'] ?? null);

                    $carrierShippingCost = 0;
                    $carrierReturnCost = 0;
                    $wilaya = \App\Models\Wilaya::find($wilayaId);
                    if ($wilaya) {
                        $shippingType = strtolower(trim($mappedData['shipping_type'] ?? ''));
                        if (str_contains($shippingType, 'desk') || str_contains($shippingType, 'stop')) {
                            $carrierShippingCost = $wilaya->real_shipping_cost_desk;
                        } else {
                            $carrierShippingCost = $wilaya->real_shipping_cost_home;
                        }
                        // For return cost, we just read it from the wilaya if it's set
                        $carrierReturnCost = $wilaya->return_cost ?? 0;
                    }

                    $orderData = [
                        'sync_source_id'      => $source->id,
                        'external_reference'  => $externalRef,
                        'customer_name'       => $mappedData['customer_name'] ?? 'Unknown',
                        'customer_phone'      => $phone,
                        'wilaya_id'           => $wilayaId,
                        'commune_id'          => $communeId,
                        'status'              => $status,
                        'notes'               => $mappedData['notes'] ?? null,
                        'order_date'          => $orderedAt ? date('Y-m-d', strtotime($orderedAt)) : now()->toDateString(),
                        'ordered_at'          => $orderedAt,
                        'tracking_number'     => $mappedData['tracking_number'] ?? null,
                        'confirmed_by'        => $employeeId,
                        'total_amount'        => (float)($mappedData['total_amount'] ?? 0),
                        'carrier_shipping_cost' => $carrierShippingCost,
                        'carrier_return_cost'   => $carrierReturnCost,
                    ];

                    if ($order) {
                        $order->update($orderData);
                        $stats['updated']++;
                    } else {
                        // Auto-generate internal reference if creating
                        $orderData['reference'] = 'ORD-' . strtoupper(Str::random(8));
                        if ($duplicateOfId) {
                            $orderData['duplicate_of_id'] = $duplicateOfId;
                        }
                        $order = Order::create($orderData);
                        $stats['created']++;
                    }

                    // 4. Handle Line Items
                    $productName = $mappedData['product_name'] ?? $mappedData['sku'] ?? 'Unknown Product';
                    $productId = $this->resolver->resolveProduct($mappedData['sku'] ?? $mappedData['product_name'] ?? null);
                    
                    $purchaseCost = 0;
                    if ($productId) {
                        $product = \App\Models\Product::find($productId);
                        if ($product) {
                            $csvQty = (int)($mappedData['quantity'] ?? 1);
                            $actualUnits = $csvQty;
                            
                            if (!empty($product->quantity_rules) && is_array($product->quantity_rules)) {
                                if (isset($product->quantity_rules[(string)$csvQty])) {
                                    $actualUnits = (int)$product->quantity_rules[(string)$csvQty];
                                }
                            }
                            
                            $purchaseCost = $actualUnits * (float)$product->purchase_cost;
                        }
                    }

                    // We use product_name to deduplicate line items since product_id can be null
                    OrderItem::updateOrCreate(
                        ['order_id' => $order->id, 'product_name' => $productName],
                        [
                            'product_id' => $productId,
                            'quantity'   => (int)($mappedData['quantity'] ?? 1),
                            'selling_price' => (float)($mappedData['unit_price'] ?? ($mappedData['total_amount'] ?? 0)),
                            'customer_shipping'=> (float)($mappedData['shipping_fee'] ?? 0),
                            'purchase_cost' => $purchaseCost,
                        ]
                    );

                    DB::commit();
                } catch (Exception $e) {
                    DB::rollBack();
                    $stats['failed']++;
                    // In a production system, log the exact row failure to an error table
                }
            }

            $syncLog->update([
                'status'            => 'success',
                'completed_at'      => now(),
                'rows_total' => $stats['processed'],
                'rows_created'   => $stats['created'],
                'rows_updated'   => $stats['updated'],
                'rows_skipped'   => $stats['skipped'],
                'rows_failed'    => $stats['failed'],
            ]);

        } catch (Exception $e) {
            $syncLog->update([
                'status'            => 'failed',
                'errors'            => json_encode(['error' => $e->getMessage()]),
                'completed_at'      => now(),
                'rows_total' => $stats['processed'] ?? 0,
            ]);
            throw $e;
        }

        return $stats;
    }
}
