<?php

// 1. Fix massive quantity rules
$products = App\Models\Product::all();
foreach ($products as $product) {
    if (!empty($product->quantity_rules) && is_array($product->quantity_rules)) {
        $rules = $product->quantity_rules;
        $needsSave = false;
        foreach ($rules as $k => $v) {
            if ((int)$v > 100) {
                // User put a price instead of a quantity. Delete it.
                unset($rules[$k]);
                $needsSave = true;
            }
        }
        if ($needsSave) {
            $product->quantity_rules = empty($rules) ? null : $rules;
            $product->save();
            echo "Fixed massive quantity rule for product: " . $product->name . "\n";
        }
    }
}

// 2. Relink orphan items
$products = App\Models\Product::all();
foreach ($products as $product) {
    // Try to find items that have similar names but no product_id
    $items = App\Models\OrderItem::whereNull('product_id')
        ->where('product_name', 'like', '%' . trim($product->name) . '%')
        ->get();
        
    foreach ($items as $item) {
        $item->product_id = $product->id;
        $item->save();
    }
}

// 3. Recalculate COGS
$orders = App\Models\Order::with(['items.product'])->get();
foreach ($orders as $order) {
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
echo "All done fixing DB.\n";
