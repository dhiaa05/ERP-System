<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\ProductController;
use App\Http\Controllers\Api\V1\SyncController;
use App\Http\Controllers\Api\V1\OrderController;
use App\Http\Controllers\Api\V1\EmployeeController;
use App\Http\Controllers\Api\V1\LeaderboardController;
use App\Http\Controllers\Api\V1\CampaignController;
use App\Http\Controllers\Api\V1\ExpenseController;
use App\Http\Controllers\Api\V1\ExpenseCategoryController;
use App\Http\Controllers\Api\V1\DashboardController;
use App\Http\Controllers\Api\V1\IntelligenceController;
use App\Http\Controllers\Api\V1\AnalyticsController;
use App\Http\Controllers\Api\V1\WilayaController;
use App\Http\Controllers\Api\V1\WebhookController;
use App\Http\Controllers\Api\V1\SettingsController;

Route::prefix('v1')->group(function () {
    // Public routes
    Route::post('/login', [AuthController::class, 'login']);
    
    // Webhooks
    Route::post('/webhooks/google-sheets', [WebhookController::class, 'googleSheets']);

    // Protected routes
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/me', [AuthController::class, 'me']);
        
        Route::apiResource('products', ProductController::class);
        Route::delete('orders/reset', [OrderController::class, 'reset']);
        Route::apiResource('orders', OrderController::class)->only(['index', 'show']);
        Route::apiResource('employees', EmployeeController::class);
        Route::apiResource('campaigns', CampaignController::class);
        Route::apiResource('expenses', ExpenseController::class);
        Route::get('expense-categories', [ExpenseCategoryController::class, 'index']);
        
        Route::get('leaderboard', [LeaderboardController::class, 'index']);
        Route::get('settings/leaderboard-visibility', [SettingsController::class, 'getLeaderboardVisibility']);
        Route::post('settings/leaderboard-visibility', [SettingsController::class, 'toggleLeaderboardVisibility']);
        
        Route::get('dashboard', [DashboardController::class, 'index']);
        
        Route::get('intelligence', [IntelligenceController::class, 'index']);
        Route::post('intelligence/alerts/{alert}/dismiss', [IntelligenceController::class, 'dismissAlert']);
        
        Route::get('analytics/cohorts', [AnalyticsController::class, 'cohorts']);
        
        Route::get('wilayas', [WilayaController::class, 'index']);
        Route::put('wilayas/{id}', [WilayaController::class, 'update']);
        
        Route::get('sync-logs', [SyncController::class, 'index']);
        Route::post('sync-sources/{source}/upload-csv', [SyncController::class, 'uploadCsv']);
    });
});
