<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\KpiService;
use Carbon\Carbon;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function __construct(private KpiService $kpiService)
    {
    }

    public function index(Request $request)
    {
        $startDate = $request->filled('start_date') 
            ? Carbon::parse($request->input('start_date')) 
            : Carbon::now()->startOfMonth();
            
        $endDate = $request->filled('end_date') 
            ? Carbon::parse($request->input('end_date')) 
            : Carbon::now()->endOfMonth();

        $kpis = $this->kpiService->getGlobalDashboardKpis($startDate, $endDate);

        return response()->json([
            'data' => $kpis,
            'meta' => [
                'start_date' => $startDate->toDateString(),
                'end_date'   => $endDate->toDateString(),
            ]
        ]);
    }
}
