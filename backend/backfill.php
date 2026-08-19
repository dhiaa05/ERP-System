<?php

$orders = App\Models\Order::with(['wilaya', 'items.product'])->get();
foreach ($orders as $order) {
    $shippingTo = $order->sync_metadata['ShippingTo?'] ?? null;
    $type = 'home';
    if ($shippingTo && strtolower(trim($shippingTo)) === 'stop desk') {
        $type = 'desk';
    }
    
    if ($order->wilaya) {
        $order->carrier_shipping_cost = $type === 'desk' ? $order->wilaya->real_shipping_cost_desk : $order->wilaya->real_shipping_cost_home;
        $order->carrier_return_cost = $order->wilaya->return_cost;
        $order->save();
    }
    
    foreach ($order->items as $item) {
        if ($item->product) {
            $csvQty = (int)$item->quantity;
            $actualUnits = $csvQty;
            $product = $item->product;
            
            if (!empty($product->quantity_rules) && is_array($product->quantity_rules)) {
                if (isset($product->quantity_rules[(string)$csvQty])) {
                    $actualUnits = (int)$product->quantity_rules[(string)$csvQty];
                }
            }
            
            $item->purchase_cost = $actualUnits * (float)$product->purchase_cost;
            $item->save();
        }
    }
}
echo "Done backfilling costs correctly.";
