<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Order;
use App\Models\Wilaya;
use Illuminate\Support\Facades\Log;

class WebhookController extends Controller
{
    public function googleSheets(Request $request)
    {
        $secret = env('WEBHOOK_SECRET', 'lamsti_secret_sheet_2026');
        
        // Accept secret via Bearer Token, Header, or Query Parameter
        $providedSecret = $request->bearerToken() 
            ?? $request->header('X-Webhook-Secret') 
            ?? $request->query('secret');

        if (!$providedSecret || $providedSecret !== $secret) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        try {
            $data = $request->all();
            Log::info('Google Sheets Webhook Received:', $data);

            // 1. Resolve Wilaya
            $wilayaId = 16; // Default to Alger (16) if not found
            if (!empty($data['wilaya'])) {
                if (is_numeric($data['wilaya'])) {
                    $wilayaId = (int) $data['wilaya'];
                } else {
                    $wilaya = Wilaya::where('name', 'LIKE', '%' . trim($data['wilaya']) . '%')->first();
                    if ($wilaya) {
                        $wilayaId = $wilaya->id;
                    }
                }
            }

            // 2. Generate a unique reference
            $lastOrder = Order::latest('id')->first();
            $nextId = $lastOrder ? $lastOrder->id + 1 : 1;
            $reference = 'ORD-' . date('Ymd') . '-' . str_pad($nextId, 5, '0', STR_PAD_LEFT);

            // 3. Build notes from product info if available
            $notes = '';
            if (!empty($data['product_name'])) {
                $qty = $data['quantity'] ?? 1;
                $notes = "Produit: {$data['product_name']} | Qté: {$qty}";
            }
            if (!empty($data['notes'])) {
                $notes .= "\nNotes: " . $data['notes'];
            }

            // 4. Create the Order
            $order = Order::create([
                'reference'          => $reference,
                'external_reference' => $data['external_reference'] ?? null,
                'order_date'         => now()->toDateString(),
                'customer_name'      => $data['customer_name'] ?? 'Client Webhook',
                'customer_phone'     => $data['customer_phone'] ?? '0000000000',
                'wilaya_id'          => $wilayaId,
                'status'             => 'pending',
                'notes'              => trim($notes),
            ]);

            return response()->json([
                'success'   => true,
                'message'   => 'Order created successfully',
                'order_id'  => $order->id,
                'reference' => $order->reference
            ]);
            
        } catch (\Exception $e) {
            Log::error('Google Sheets Webhook Error: ' . $e->getMessage());
            return response()->json([
                'error'   => 'Internal Server Error',
                'details' => $e->getMessage()
            ], 500);
        }
    }
}
