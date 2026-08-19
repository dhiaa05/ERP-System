<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'             => $this->id,
            'name'           => $this->name,
            'sku'            => $this->sku,
            'category_id'    => $this->category_id,
            'category_name'  => $this->whenLoaded('category', fn() => $this->category->name),
            'selling_price'  => (float) $this->selling_price,
            'purchase_price' => (float) $this->purchase_price,
            'quantity_rules' => $this->quantity_rules,
            'is_active'      => (bool) $this->is_active,
            'created_at'     => $this->created_at?->toIso8601String(),
            'updated_at'     => $this->updated_at?->toIso8601String(),
        ];
    }
}
