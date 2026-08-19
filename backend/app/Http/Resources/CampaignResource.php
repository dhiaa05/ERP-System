<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CampaignResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'             => $this->id,
            'name'           => $this->name,
            'product_id'     => $this->product_id,
            'product_name'   => $this->whenLoaded('product', fn() => $this->product->name),
            'date'           => $this->date->format('Y-m-d'),
            'facebook_spend' => (float) $this->facebook_spend,
            'leads'          => (int) $this->leads,
            'notes'          => $this->notes,
            'external_id'    => $this->external_id,
            'created_at'     => $this->created_at?->toIso8601String(),
            'updated_at'     => $this->updated_at?->toIso8601String(),
        ];
    }
}
