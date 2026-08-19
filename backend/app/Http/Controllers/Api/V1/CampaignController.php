<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCampaignRequest;
use App\Http\Requests\UpdateCampaignRequest;
use App\Http\Resources\CampaignResource;
use App\Models\Campaign;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CampaignController extends Controller
{
    public function index(Request $request)
    {
        $query = Campaign::with('product')->latest('date');

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where('name', 'like', "%{$search}%");
        }

        if ($request->filled('product_id')) {
            $query->where('product_id', $request->input('product_id'));
        }

        $perPage = $request->input('per_page', 15);
        return CampaignResource::collection($query->paginate($perPage));
    }

    public function store(StoreCampaignRequest $request)
    {
        $data = $request->validated();
        $data['created_by'] = Auth::id();
        
        $campaign = Campaign::create($data);
        return new CampaignResource($campaign->load('product'));
    }

    public function show(Campaign $campaign)
    {
        return new CampaignResource($campaign->load('product'));
    }

    public function update(UpdateCampaignRequest $request, Campaign $campaign)
    {
        $data = $request->validated();
        $data['updated_by'] = Auth::id();

        $campaign->update($data);
        return new CampaignResource($campaign->load('product'));
    }

    public function destroy(Campaign $campaign)
    {
        $campaign->delete();
        return response()->noContent();
    }
}
