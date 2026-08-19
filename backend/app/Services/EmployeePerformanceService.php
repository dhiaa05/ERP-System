<?php

namespace App\Services;

use App\Models\Employee;
use App\Models\Order;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class EmployeePerformanceService
{
    /**
     * Calculate performance leaderboard for confirmation employees
     * 
     * Weights:
     * Delivery Rate: 35%
     * Confirmation Rate: 20%
     * Average Profit: 20%
     * Total Net Profit: 15%
     * Low Refusal Rate: 5%
     * Low Return Rate: 5%
     */
    public function getLeaderboard(?Carbon $startDate = null, ?Carbon $endDate = null): array
    {
        $startDate = $startDate ?? Carbon::now()->startOfMonth();
        $endDate = $endDate ?? Carbon::now()->endOfMonth();

        $employees = Employee::where('role', 'confirmation')
            ->where('is_active', true)
            ->get();

        $results = [];

        foreach ($employees as $emp) {
            $stats = $this->getEmployeeRawStats($emp->id, $startDate, $endDate);
            
            // Avoid division by zero
            $sent = $stats['sent'] ?: 1;
            $handled = $stats['total_handled'] ?: 1;
            $delivered = $stats['delivered'] ?: 1;

            $deliveryRate = ($stats['delivered'] / $sent) * 100;
            $confirmationRate = ($stats['confirmed'] / $handled) * 100;
            $refusalRate = ($stats['refused'] / $sent) * 100;
            $returnRate = ($stats['returned'] / $sent) * 100;
            $averageProfit = $stats['gross_profit'] / $delivered;

            $results[] = [
                'employee' => $emp,
                'raw' => [
                    'handled' => $stats['total_handled'],
                    'confirmed' => $stats['confirmed'],
                    'sent' => $stats['sent'],
                    'delivered' => $stats['delivered'],
                    'refused' => $stats['refused'],
                    'returned' => $stats['returned'],
                ],
                'rates' => [
                    'delivery' => round($deliveryRate, 2),
                    'confirmation' => round($confirmationRate, 2),
                    'refusal' => round($refusalRate, 2),
                    'return' => round($returnRate, 2),
                    'average_profit' => round($averageProfit, 2),
                    'total_profit' => round($stats['gross_profit'], 2),
                ],
            ];
        }

        // Find Maximums for normalization (Profit metrics)
        $maxAvgProfit = max(array_column(array_column($results, 'rates'), 'average_profit')) ?: 1;
        $maxTotalProfit = max(array_column(array_column($results, 'rates'), 'total_profit')) ?: 1;

        // Calculate Final Score
        foreach ($results as &$res) {
            $rates = $res['rates'];
            
            $scoreDelivery = $rates['delivery'];
            $scoreConfirmation = $rates['confirmation'];
            $scoreRefusal = max(0, 100 - $rates['refusal']); // Inverse
            $scoreReturn = max(0, 100 - $rates['return']); // Inverse
            
            // Normalize profit relative to the top performer in this time period
            $scoreAvgProfit = ($rates['average_profit'] / $maxAvgProfit) * 100;
            $scoreTotalProfit = ($rates['total_profit'] / $maxTotalProfit) * 100;

            // Apply Weights
            $finalScore = 
                ($scoreDelivery * 0.35) +
                ($scoreConfirmation * 0.20) +
                ($scoreAvgProfit * 0.20) +
                ($scoreTotalProfit * 0.15) +
                ($scoreRefusal * 0.05) +
                ($scoreReturn * 0.05);

            $res['score'] = round($finalScore, 2);
        }

        // Sort by final score descending
        usort($results, fn($a, $b) => $b['score'] <=> $a['score']);
        
        // Add Rank
        foreach ($results as $index => &$res) {
            $res['rank'] = $index + 1;
        }

        return $results;
    }

    private function getEmployeeRawStats(int $employeeId, Carbon $startDate, Carbon $endDate): array
    {
        $orders = Order::with(['items.product'])
            ->where('confirmed_by', $employeeId)
            ->whereBetween('order_date', [$startDate->toDateString(), $endDate->toDateString()])
            ->get();

        $stats = [
            'total_handled' => $orders->count(),
            'confirmed' => 0,
            'sent' => 0,
            'delivered' => 0,
            'refused' => 0,
            'returned' => 0,
            'gross_profit' => 0,
        ];

        foreach ($orders as $order) {
            // Confirmation logic: anything past pending/unreachable/cancelled is considered confirmed
            if (in_array($order->status, ['confirmed', 'sent', 'delivered', 'returned', 'refused'])) {
                $stats['confirmed']++;
            }

            // Sent logic
            if (in_array($order->status, ['sent', 'delivered', 'returned', 'refused'])) {
                $stats['sent']++;
            }

            if ($order->status === 'delivered') {
                $stats['delivered']++;
                
                // Calculate Profit: Total Amount - Shipping - Cost of Goods
                $costOfGoods = $order->items->sum(function ($item) {
                    return $item->quantity * ($item->product->purchase_price ?? 0);
                });
                
                $profit = $order->total_amount - $order->shipping_fee - $costOfGoods;
                $stats['gross_profit'] += $profit;
            }

            if ($order->status === 'refused') $stats['refused']++;
            if ($order->status === 'returned') $stats['returned']++;
        }

        return $stats;
    }
}
