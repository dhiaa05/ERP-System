<?php

namespace App\Services;

use App\Models\AlertThreshold;
use App\Models\BusinessAlert;
use Carbon\Carbon;

class AlertGeneratorService
{
    public function __construct(private KpiService $kpiService)
    {
    }

    public function generateDailyAlerts()
    {
        // For the MVP, we check "Month to Date" KPIs
        $startDate = Carbon::now()->startOfMonth();
        $endDate = Carbon::now();

        $kpis = $this->kpiService->getGlobalDashboardKpis($startDate, $endDate);
        
        $metrics = [
            'delivery_rate' => $kpis['orders']['delivery_rate'],
            'roas' => $kpis['overview']['roas'],
            'net_profit' => $kpis['overview']['net_profit'],
            'cpa' => $kpis['overview']['cpa'],
        ];

        $thresholds = AlertThreshold::where('is_active', true)->get();

        foreach ($thresholds as $threshold) {
            $currentValue = $metrics[$threshold->metric] ?? null;
            
            if ($currentValue === null) continue;

            $isBreached = false;
            switch ($threshold->operator) {
                case 'lt': $isBreached = $currentValue < $threshold->threshold_value; break;
                case 'gt': $isBreached = $currentValue > $threshold->threshold_value; break;
                case 'lte': $isBreached = $currentValue <= $threshold->threshold_value; break;
                case 'gte': $isBreached = $currentValue >= $threshold->threshold_value; break;
                case 'eq': $isBreached = $currentValue == $threshold->threshold_value; break;
            }

            if ($isBreached) {
                // Check if an active alert already exists for this threshold in this period
                $exists = BusinessAlert::where('alert_threshold_id', $threshold->id)
                    ->where('is_dismissed', false)
                    ->where('period_start', $startDate->toDateString())
                    ->exists();

                if (!$exists) {
                    BusinessAlert::create([
                        'alert_threshold_id' => $threshold->id,
                        'subject_type' => 'global',
                        'severity' => $threshold->severity,
                        'title' => "{$threshold->label} : Actuel {$currentValue}",
                        'description' => "Seuil critique franchi ({$threshold->operator} {$threshold->threshold_value}).",
                        'current_value' => $currentValue,
                        'threshold_value' => $threshold->threshold_value,
                        'period_start' => $startDate->toDateString(),
                        'period_end' => $endDate->toDateString(),
                    ]);
                }
            }
        }
    }
}
