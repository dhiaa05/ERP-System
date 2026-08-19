<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\BusinessAlert;
use App\Models\Insight;
use App\Services\AlertGeneratorService;
use App\Services\InsightGeneratorService;
use Illuminate\Http\Request;

class IntelligenceController extends Controller
{
    public function __construct(
        private AlertGeneratorService $alertService,
        private InsightGeneratorService $insightService
    ) {}

    public function index(Request $request)
    {
        // For MVP: Auto-generate on fetch to simulate the scheduled job
        $this->alertService->generateDailyAlerts();
        $this->insightService->generateInsights();

        $alerts = BusinessAlert::where('is_dismissed', false)
            ->latest('created_at')
            ->get();

        $insights = Insight::latest('created_at')
            ->limit(10)
            ->get();

        return response()->json([
            'data' => [
                'alerts' => $alerts,
                'insights' => $insights,
            ]
        ]);
    }

    public function dismissAlert(BusinessAlert $alert)
    {
        $alert->update([
            'is_dismissed' => true,
            'dismissed_by' => auth()->id(),
            'dismissed_at' => now(),
        ]);

        return response()->json(['status' => 'success']);
    }
}
