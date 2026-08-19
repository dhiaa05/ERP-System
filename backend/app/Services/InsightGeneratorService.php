<?php

namespace App\Services;

use App\Models\Insight;
use Carbon\Carbon;

class InsightGeneratorService
{
    public function __construct(private KpiService $kpiService)
    {
    }

    public function generateInsights()
    {
        $currentStart = Carbon::now()->startOfMonth();
        $currentEnd = Carbon::now();
        
        $prevStart = Carbon::now()->subMonth()->startOfMonth();
        $prevEnd = Carbon::now()->subMonth()->endOfMonth();

        $currentKpis = $this->kpiService->getGlobalDashboardKpis($currentStart, $currentEnd);
        $prevKpis = $this->kpiService->getGlobalDashboardKpis($prevStart, $prevEnd);

        // 1. Revenue Insight
        $currRev = $currentKpis['overview']['revenue'];
        $prevRev = $prevKpis['overview']['revenue'];
        
        if ($prevRev > 0) {
            $growth = (($currRev - $prevRev) / $prevRev) * 100;
            if ($growth > 10) {
                Insight::create([
                    'type' => 'business_positive',
                    'subject_type' => 'global',
                    'period_start' => $currentStart->toDateString(),
                    'period_end' => $currentEnd->toDateString(),
                    'text' => "Excellente croissance ! Le chiffre d'affaires a augmenté de " . round($growth) . "% par rapport au mois dernier.",
                    'data' => ['growth' => $growth, 'current' => $currRev, 'previous' => $prevRev],
                ]);
            } elseif ($growth < -10) {
                Insight::create([
                    'type' => 'business_warning',
                    'subject_type' => 'global',
                    'period_start' => $currentStart->toDateString(),
                    'period_end' => $currentEnd->toDateString(),
                    'text' => "Attention : Le chiffre d'affaires est en baisse de " . abs(round($growth)) . "% ce mois-ci.",
                    'data' => ['growth' => $growth, 'current' => $currRev, 'previous' => $prevRev],
                ]);
            }
        }

        // 2. Delivery Rate Insight
        $currDel = $currentKpis['orders']['delivery_rate'];
        $prevDel = $prevKpis['orders']['delivery_rate'];

        if ($currDel > 0 && $prevDel > 0) {
            if ($currDel > $prevDel + 5) {
                Insight::create([
                    'type' => 'business_positive',
                    'subject_type' => 'global',
                    'period_start' => $currentStart->toDateString(),
                    'period_end' => $currentEnd->toDateString(),
                    'text' => "Le taux de livraison s'est amélioré, passant à {$currDel}%.",
                    'data' => ['current' => $currDel, 'previous' => $prevDel],
                ]);
            }
        }
    }
}
