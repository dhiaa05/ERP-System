<?php

namespace App\Services;

use App\Models\Order;
use App\Models\Campaign;
use App\Models\Expense;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class KpiService
{
    public function getGlobalDashboardKpis(Carbon $startDate, Carbon $endDate): array
    {
        $start = $startDate->startOfDay();
        $end = $endDate->endOfDay();
        
        $todayStart = Carbon::today()->startOfDay();
        $todayEnd = Carbon::today()->endOfDay();

        // 1. Fetch Data
        $orders = Order::with(['items.product', 'wilaya', 'confirmedBy'])
            ->whereBetween('order_date', [$start->toDateString(), $end->toDateString()])
            ->get();

        $campaigns = Campaign::whereBetween('date', [$start->toDateString(), $end->toDateString()])->get();
        $expenses = Expense::whereBetween('date', [$start->toDateString(), $end->toDateString()])->get();

        // 2. Aggregate Base Metrics
        $totalOrders = $orders->count();
        $confirmedOrders = 0;
        $deliveredOrders = 0;
        $returnedOrders = 0;
        $refusedOrders = 0;
        
        $revenue = 0;
        $cogs = 0;
        $shipping = 0;
        
        // Today's metrics
        $todayOrdersCount = 0;
        $todayRevenue = 0;

        // Rankings Data Arrays
        $productsSales = [];
        $wilayaSales = [];
        $employeeConfirmations = [];

        // Time Series Data
        $timeSeries = [];
        // Initialize time series array with all dates in range
        $currentDate = $start->copy();
        while ($currentDate <= $end) {
            $dateStr = $currentDate->format('Y-m-d');
            $timeSeries[$dateStr] = [
                'date' => $dateStr,
                'orders' => 0,
                'revenue' => 0,
                'profit' => 0,
                'marketing_spend' => 0,
                'confirmed_count' => 0,
                'delivered_count' => 0,
                'total_count' => 0,
            ];
            $currentDate->addDay();
        }

        foreach ($orders as $order) {
            $dateStr = $order->order_date->format('Y-m-d');
            $isToday = $order->order_date->isSameDay(Carbon::today());
            
            if ($isToday) {
                $todayOrdersCount++;
            }
            
            if (isset($timeSeries[$dateStr])) {
                $timeSeries[$dateStr]['orders']++;
                $timeSeries[$dateStr]['total_count']++;
            }

            // Wilaya Ranking
            if ($order->wilaya_id && $order->wilaya) {
                $wName = $order->wilaya->name;
                if (!isset($wilayaSales[$wName])) {
                    $wilayaSales[$wName] = ['name' => $wName, 'orders' => 0, 'delivered' => 0];
                }
                $wilayaSales[$wName]['orders']++;
            }

            // Employee Ranking
            if ($order->confirmed_by && $order->confirmedBy) {
                $eName = $order->confirmedBy->first_name . ' ' . $order->confirmedBy->last_name;
                if (!isset($employeeConfirmations[$eName])) {
                    $employeeConfirmations[$eName] = ['name' => $eName, 'confirmations' => 0];
                }
            }

            if (in_array($order->status, ['confirmed', 'sent', 'delivered', 'returned', 'refused'])) {
                $confirmedOrders++;
                if (isset($timeSeries[$dateStr])) $timeSeries[$dateStr]['confirmed_count']++;
                
                if ($order->confirmed_by && $order->confirmedBy) {
                    $eName = $order->confirmedBy->first_name . ' ' . $order->confirmedBy->last_name;
                    $employeeConfirmations[$eName]['confirmations']++;
                }
            }

            if ($order->status === 'returned') $returnedOrders++;
            if ($order->status === 'refused') $refusedOrders++;
            
            // Product Ranking
            foreach ($order->items as $item) {
                $pName = $item->product ? $item->product->name : 'Unknown';
                if (!isset($productsSales[$pName])) {
                    $productsSales[$pName] = ['name' => $pName, 'sales' => 0, 'revenue' => 0];
                }
                $productsSales[$pName]['sales'] += $item->quantity;
                $productsSales[$pName]['revenue'] += $item->total_price;
            }

            if ($order->status === 'delivered') {
                $deliveredOrders++;
                $revenue += $order->total_amount;
                $shipping += $order->shipping_fee;
                
                if ($isToday) {
                    $todayRevenue += $order->total_amount;
                }

                if (isset($timeSeries[$dateStr])) {
                    $timeSeries[$dateStr]['delivered_count']++;
                    $timeSeries[$dateStr]['revenue'] += $order->total_amount;
                }

                if ($order->wilaya_id && $order->wilaya) {
                    $wName = $order->wilaya->name;
                    $wilayaSales[$wName]['delivered']++;
                }

                $orderCogs = 0;
                foreach ($order->items as $item) {
                    $itemCogs = $item->quantity * ($item->product->purchase_price ?? 0);
                    $orderCogs += $itemCogs;
                }
                $cogs += $orderCogs;
                
                if (isset($timeSeries[$dateStr])) {
                    // Approximate daily profit (Revenue - COGS - Shipping). Marketing/overheads subtracted later if needed.
                    $timeSeries[$dateStr]['profit'] += ($order->total_amount - $orderCogs - $order->shipping_fee);
                }
            }
        }

        // Marketing Data
        $marketingSpend = 0;
        foreach ($campaigns as $campaign) {
            $dateStr = Carbon::parse($campaign->date)->format('Y-m-d');
            $spend = $campaign->facebook_spend + $campaign->tiktok_spend + $campaign->snapchat_spend;
            $marketingSpend += $spend;
            
            if (isset($timeSeries[$dateStr])) {
                $timeSeries[$dateStr]['marketing_spend'] += $spend;
                // Subtract marketing spend from daily profit
                $timeSeries[$dateStr]['profit'] -= $spend;
            }
        }

        // Overheads
        $totalOverheads = $expenses->sum('amount');
        // Distribute overheads evenly across days for the chart
        $daysCount = count($timeSeries);
        $dailyOverhead = $daysCount > 0 ? ($totalOverheads / $daysCount) : 0;
        foreach ($timeSeries as $key => $data) {
            $timeSeries[$key]['profit'] -= $dailyOverhead;
        }

        $grossProfit = $revenue - $cogs - $shipping;
        $netProfit = $grossProfit - $marketingSpend - $totalOverheads;
        
        // Expected Profit = Net Profit + (Expected profit from Confirmed/Sent orders * average delivery rate)
        // For MVP, expected profit is a rough estimation
        $avgOrderValue = $deliveredOrders > 0 ? ($revenue / $deliveredOrders) : 0;
        $avgProfitPerOrder = $deliveredOrders > 0 ? ($netProfit / $deliveredOrders) : 0;
        $pendingOrdersCount = Order::whereBetween('order_date', [$start->toDateString(), $end->toDateString()])
                                   ->whereIn('status', ['confirmed', 'sent'])
                                   ->count();
        $expectedProfit = $netProfit + ($pendingOrdersCount * $avgProfitPerOrder * 0.6); // assuming 60% delivery rate for pending

        // Rates
        $confirmationRate = $totalOrders > 0 ? ($confirmedOrders / $totalOrders) * 100 : 0;
        $deliveryRate = $totalOrders > 0 ? ($deliveredOrders / $totalOrders) * 100 : 0;
        $returnRate = $totalOrders > 0 ? ($returnedOrders / $totalOrders) * 100 : 0;
        $refusalRate = $totalOrders > 0 ? ($refusedOrders / $totalOrders) * 100 : 0;
        $roas = $marketingSpend > 0 ? ($revenue / $marketingSpend) : 0;
        
        // Break-even CPA: Average Gross Margin per order
        $breakEvenCpa = $deliveredOrders > 0 ? ($grossProfit / $deliveredOrders) : 0;
        
        // Employee Score (Simple mock: based on confirmation rate + volume)
        $employeeScore = min(100, max(0, ($confirmationRate * 0.7) + 20));

        // Business Health Score Algorithm (0-100)
        // Weighted average of Net Profit Margin, Delivery Rate, Confirmation Rate, ROAS
        $profitMargin = $revenue > 0 ? ($netProfit / $revenue) * 100 : 0;
        $healthScore = 
            (min($profitMargin, 30) / 30 * 40) + // 40% weight to profit margin (target 30%)
            (min($deliveryRate, 70) / 70 * 30) + // 30% weight to delivery rate (target 70%)
            (min($roas, 4) / 4 * 20) +           // 20% weight to ROAS (target 4)
            (min($confirmationRate, 80) / 80 * 10); // 10% weight to confirmation (target 80%)
        
        $healthScore = min(100, max(0, $healthScore));

        // Format Time Series
        $formattedTimeSeries = [];
        foreach ($timeSeries as $data) {
            $data['confirmation_rate'] = $data['total_count'] > 0 ? ($data['confirmed_count'] / $data['total_count']) * 100 : 0;
            $data['delivery_rate'] = $data['total_count'] > 0 ? ($data['delivered_count'] / $data['total_count']) * 100 : 0;
            $data['roas'] = $data['marketing_spend'] > 0 ? ($data['revenue'] / $data['marketing_spend']) : 0;
            $formattedTimeSeries[] = $data;
        }

        // Format Rankings
        usort($productsSales, fn($a, $b) => $b['sales'] <=> $a['sales']);
        $productsSales = array_slice($productsSales, 0, 10);

        usort($wilayaSales, fn($a, $b) => $b['orders'] <=> $a['orders']);
        $wilayaSales = array_slice($wilayaSales, 0, 10);
        foreach ($wilayaSales as &$w) {
            $w['delivery_rate'] = $w['orders'] > 0 ? round(($w['delivered'] / $w['orders']) * 100, 2) : 0;
        }

        usort($employeeConfirmations, fn($a, $b) => $b['confirmations'] <=> $a['confirmations']);
        $employeeConfirmations = array_slice($employeeConfirmations, 0, 10);

        // Insights & Alerts
        $alerts = [];
        if ($healthScore < 50) $alerts[] = "Business health is critically low. Review ad spend and delivery rates immediately.";
        if ($roas < 2 && $marketingSpend > 0) $alerts[] = "ROAS is below 2.0. Your marketing campaigns might be losing money.";
        if ($deliveryRate < 50 && $totalOrders > 50) $alerts[] = "Delivery rate is concerningly low (< 50%). Investigate delivery company performance.";

        $insights = [
            "summary" => $netProfit > 0 ? "You are operating at a profit." : "You are currently operating at a loss for this period.",
            "recommendations" => [],
            "alerts" => $alerts
        ];

        return [
            'top_kpis' => [
                'health_score' => round($healthScore),
                'net_profit' => round($netProfit, 2),
                'expected_profit' => round($expectedProfit, 2),
                'delivery_rate' => round($deliveryRate, 2),
                'confirmation_rate' => round($confirmationRate, 2),
                'today_revenue' => round($todayRevenue, 2),
                'today_orders' => $todayOrdersCount,
                'break_even_cpa' => round($breakEvenCpa, 2),
                'roas' => round($roas, 2),
                'marketing_spend' => round($marketingSpend, 2),
            ],
            'circular_kpis' => [
                'health_score' => round($healthScore),
                'confirmation_rate' => round($confirmationRate, 2),
                'delivery_rate' => round($deliveryRate, 2),
                'return_rate' => round($returnRate, 2),
                'refusal_rate' => round($refusalRate, 2),
                'employee_score' => round($employeeScore),
            ],
            'time_series' => array_values($formattedTimeSeries),
            'rankings' => [
                'products' => $productsSales,
                'wilayas' => $wilayaSales,
                'employees' => $employeeConfirmations,
            ],
            'insights' => $insights
        ];
    }
}
