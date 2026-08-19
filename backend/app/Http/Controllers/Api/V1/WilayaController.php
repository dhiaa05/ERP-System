<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Wilaya;

class WilayaController extends Controller
{
    public function index()
    {
        return Wilaya::all();
    }

    public function update(Request $request, string $id)
    {
        $wilaya = Wilaya::findOrFail($id);
        
        $validated = $request->validate([
            'real_shipping_cost_home' => 'nullable|numeric|min:0',
            'real_shipping_cost_desk' => 'nullable|numeric|min:0',
            'return_cost' => 'nullable|numeric|min:0',
        ]);
        
        $wilaya->update($validated);
        
        return response()->json($wilaya);
    }
}
