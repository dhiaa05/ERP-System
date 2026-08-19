<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $sortField = $request->input('sort_by', 'order_date');
        $sortDir = $request->input('sort_dir', 'desc');
        
        $query = Order::with(['wilaya', 'commune', 'duplicateOf', 'items.product'])->orderBy($sortField, $sortDir);

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('reference', 'like', "%{$search}%")
                  ->orWhere('external_reference', 'like', "%{$search}%")
                  ->orWhere('customer_name', 'like', "%{$search}%")
                  ->orWhere('customer_phone', 'like', "%{$search}%");
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->filled('date_from')) {
            $query->where('order_date', '>=', $request->input('date_from'));
        }

        if ($request->filled('date_to')) {
            $query->where('order_date', '<=', $request->input('date_to'));
        }

        if ($request->filled('confirmed_by')) {
            $query->where('confirmed_by', $request->input('confirmed_by'));
        }

        if ($request->filled('product_id')) {
            $productId = $request->input('product_id');
            $query->whereHas('items', function ($q) use ($productId) {
                $q->where('product_id', $productId);
            });
        }

        $perPage = $request->input('per_page', 15);
        
        return OrderResource::collection($query->paginate($perPage));
    }

    /**
     * Display the specified resource.
     */
    public function show(Order $order)
    {
        $order->load(['wilaya', 'commune', 'items.product']);
        return new OrderResource($order);
    }

    /**
     * Reset all orders, items and sync logs.
     */
    public function reset()
    {
        \Illuminate\Support\Facades\DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        \Illuminate\Support\Facades\DB::table('order_items')->truncate();
        \Illuminate\Support\Facades\DB::table('orders')->truncate();
        \Illuminate\Support\Facades\DB::table('sync_logs')->truncate();
        \Illuminate\Support\Facades\DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        return response()->json(['message' => 'Toutes les commandes ont été supprimées avec succès.']);
    }
}
