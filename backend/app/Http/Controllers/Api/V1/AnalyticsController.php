<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Order;
use App\Models\Campaign;

class AnalyticsController extends Controller
{
    public function cohorts(Request $request)
    {
        $productId = $request->input('product_id');

        $query = Order::query()
            ->with(['items', 'confirmedBy'])
            ->whereNotNull('order_date');
            
        if ($productId) {
            $query->whereHas('items', function($q) use ($productId) {
                $q->where('product_id', $productId);
            });
        }

        $orders = $query->get();
        
        $grouped = $orders->groupBy(function($order) {
            return $order->order_date->format('Y-m-d');
        });

        $cohorts = [];

        $campaignQuery = Campaign::query();
        if ($productId) {
            $campaignQuery->where('product_id', $productId);
        }
        $campaigns = $campaignQuery->get()->groupBy(function($camp) {
            return $camp->date->format('Y-m-d');
        });

        foreach ($grouped as $date => $dayOrders) {
            $totalLeads = $dayOrders->count();
            // We consider these statuses as 'delivered' equivalent based on previous code
            $delivered = $dayOrders->filter(fn($o) => in_array(strtolower($o->status), ['livré', 'delivered']));
            $returned = $dayOrders->filter(fn($o) => in_array(strtolower($o->status), ['returned', 'refused', 'retour', 'refusé']));

            $totalRevenue = 0;
            $totalCOGS = 0;
            $totalCustomerShipping = 0;
            $totalCarrierShippingCost = 0;
            $totalCarrierReturnCost = 0;
            $totalCommissions = 0;

            foreach ($delivered as $order) {
                $totalCarrierShippingCost += $order->carrier_shipping_cost ?? 0;
                
                if ($order->confirmedBy && $order->confirmedBy->commission_per_delivered) {
                    $totalCommissions += $order->confirmedBy->commission_per_delivered;
                }

                foreach ($order->items as $item) {
                    if ($productId && $item->product_id != $productId) continue;
                    
                    $totalRevenue += $item->selling_price;
                    $totalCOGS += $item->purchase_cost;
                    $totalCustomerShipping += $item->customer_shipping;
                }
            }
            
            foreach ($returned as $order) {
                $totalCarrierReturnCost += $order->carrier_return_cost ?? 0;
            }

            $shippingSubsidy = $totalCarrierShippingCost - $totalCustomerShipping;

            $adSpend = 0;
            if (isset($campaigns[$date])) {
                $adSpend = $campaigns[$date]->sum('facebook_spend');
            }

            $netProfit = $totalRevenue - $totalCOGS - $totalCommissions - $shippingSubsidy - $totalCarrierReturnCost - $adSpend;
            
            $confirmedStatuses = ['confirmed', 'prep', 'sent', 'expédié', 'livré', 'delivered', 'returned', 'refused', 'retour', 'refusé'];
            $sentStatuses = ['sent', 'expédié', 'livré', 'delivered', 'returned', 'refused', 'retour', 'refusé'];

            $confirmed = $dayOrders->filter(fn($o) => in_array(strtolower($o->status), $confirmedStatuses));
            $sent = $dayOrders->filter(fn($o) => in_array(strtolower($o->status), $sentStatuses));

            $confirmedCount = $confirmed->count();
            $sentCount = $sent->count();

            $confirmationRate = $totalLeads > 0 ? round(($confirmedCount / $totalLeads) * 100, 2) : 0;
            $realDeliveryRate = $sentCount > 0 ? round(($delivered->count() / $sentCount) * 100, 2) : 0;

            $deliveryRate = $totalLeads > 0 ? round(($delivered->count() / $totalLeads) * 100, 2) : 0;
            $returnRate = $totalLeads > 0 ? round(($returned->count() / $totalLeads) * 100, 2) : 0;

            $formattedOrders = $dayOrders->map(function($o) use ($productId) {
                $oStatus = strtolower($o->status);
                $isDelivered = in_array($oStatus, ['livré', 'delivered']);
                $isReturned = in_array($oStatus, ['returned', 'refused', 'retour', 'refusé']);

                $rev = 0;
                $cogs = 0;
                $custShip = 0;
                $prodNames = [];

                foreach ($o->items as $item) {
                    if ($productId && $item->product_id != $productId) continue;
                    $prodNames[] = $item->product_name;
                    if ($isDelivered) {
                        $rev += $item->selling_price;
                        $cogs += $item->purchase_cost;
                        $custShip += $item->customer_shipping;
                    }
                }

                $orderNetProfit = 0;
                if ($isDelivered) {
                    $comm = ($o->confirmedBy && $o->confirmedBy->commission_per_delivered) ? $o->confirmedBy->commission_per_delivered : 0;
                    $subsidy = ($o->carrier_shipping_cost ?? 0) - $custShip;
                    $orderNetProfit = $rev - $cogs - $comm - $subsidy;
                } else if ($isReturned) {
                    $orderNetProfit = -($o->carrier_return_cost ?? 0);
                }

                return [
                    'id' => $o->id,
                    'reference' => $o->reference,
                    'customer_name' => $o->customer_name,
                    'products' => implode(', ', array_unique($prodNames)),
                    'total_amount' => $o->total_amount,
                    'shipping_cost' => $o->carrier_shipping_cost ?? 0,
                    'return_cost' => $o->carrier_return_cost ?? 0,
                    'status' => $o->status,
                    'is_delivered' => $isDelivered,
                    'is_returned' => $isReturned,
                    'net_profit' => $orderNetProfit,
                ];
            })->values()->toArray();

            $cohorts[] = [
                'date' => $date,
                'leads' => $totalLeads,
                'confirmed' => $confirmedCount,
                'sent' => $sentCount,
                'confirmation_rate' => $confirmationRate,
                'real_delivery_rate' => $realDeliveryRate,
                'delivered' => $delivered->count(),
                'returned' => $returned->count(),
                'delivery_rate' => $deliveryRate,
                'return_rate' => $returnRate,
                'revenue' => $totalRevenue,
                'cogs' => $totalCOGS,
                'commissions' => $totalCommissions,
                'shipping_subsidy' => $shippingSubsidy,
                'return_cost' => $totalCarrierReturnCost,
                'ad_spend' => $adSpend,
                'net_profit' => $netProfit,
                'status' => $netProfit > 0 ? 'profitable' : ($netProfit < 0 ? 'losing' : 'break-even'),
                'orders' => $formattedOrders,
            ];
        }
        
        foreach ($campaigns as $date => $camps) {
            if (!isset($grouped[$date])) {
                $adSpend = $camps->sum('facebook_spend');
                $cohorts[] = [
                    'date' => $date,
                    'leads' => 0,
                    'confirmed' => 0,
                    'sent' => 0,
                    'confirmation_rate' => 0,
                    'real_delivery_rate' => 0,
                    'delivered' => 0,
                    'returned' => 0,
                    'delivery_rate' => 0,
                    'return_rate' => 0,
                    'revenue' => 0,
                    'cogs' => 0,
                    'commissions' => 0,
                    'shipping_subsidy' => 0,
                    'return_cost' => 0,
                    'ad_spend' => $adSpend,
                    'net_profit' => -$adSpend,
                    'status' => 'losing',
                ];
            }
        }

        usort($cohorts, function($a, $b) {
            return strtotime($b['date']) - strtotime($a['date']);
        });

        return response()->json(['data' => $cohorts]);
    }
}
