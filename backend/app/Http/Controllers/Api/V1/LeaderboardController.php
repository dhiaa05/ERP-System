<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\EmployeePerformanceService;
use App\Models\Setting;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class LeaderboardController extends Controller
{
    public function __construct(private EmployeePerformanceService $performanceService)
    {
    }

    public function index(Request $request)
    {
        if (Auth::user()->role !== 'admin') {
            $setting = Setting::where('key', 'leaderboard_visible_to_employees')->first();
            if (!$setting || $setting->value !== 'true') {
                return response()->json([
                    'message' => 'Leaderboard is currently hidden by Admin',
                    'is_hidden' => true
                ], 403);
            }
        }
        $startDate = $request->filled('start_date') 
            ? Carbon::parse($request->input('start_date')) 
            : Carbon::now()->startOfMonth();
            
        $endDate = $request->filled('end_date') 
            ? Carbon::parse($request->input('end_date')) 
            : Carbon::now()->endOfMonth();

        $leaderboard = $this->performanceService->getLeaderboard($startDate, $endDate);

        return response()->json([
            'data' => $leaderboard,
            'meta' => [
                'start_date' => $startDate->toDateString(),
                'end_date'   => $endDate->toDateString(),
            ]
        ]);
    }
}
