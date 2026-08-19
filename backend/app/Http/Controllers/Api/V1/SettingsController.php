<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class SettingsController extends Controller
{
    public function getLeaderboardVisibility()
    {
        $setting = Setting::firstOrCreate(
            ['key' => 'leaderboard_visible_to_employees'],
            ['value' => 'false']
        );
        
        return response()->json([
            'leaderboard_visible_to_employees' => $setting->value
        ]);
    }
    
    public function toggleLeaderboardVisibility(Request $request)
    {
        if (Auth::user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        
        $request->validate([
            'visible' => 'required|boolean'
        ]);
        
        $setting = Setting::firstOrCreate(['key' => 'leaderboard_visible_to_employees']);
        $setting->value = $request->input('visible') ? 'true' : 'false';
        $setting->save();
        
        return response()->json([
            'leaderboard_visible_to_employees' => $setting->value
        ]);
    }
}
