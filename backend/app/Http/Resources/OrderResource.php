<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                 => $this->id,
            'reference'          => $this->reference,
            'external_reference' => $this->external_reference,
            'customer_name'      => $this->customer_name,
            'customer_phone'     => $this->customer_phone,
            'customer_address'   => $this->customer_address,
            'wilaya_name'        => $this->whenLoaded('wilaya', fn() => $this->wilaya->name),
            'commune_name'       => $this->whenLoaded('commune', fn() => $this->commune->name),
            'status'             => $this->status,
            'total_amount'       => (float) $this->total_amount,
            'shipping_fee'       => (float) $this->shipping_fee,
            'notes'              => $this->notes,
            'items'              => $this->whenLoaded('items', fn() => $this->items->map(function ($item) {
                return [
                    'id'          => $item->id,
                    'product_name'=> $item->product ? $item->product->name : 'Unknown Product',
                    'quantity'    => $item->quantity,
                    'unit_price'  => (float) $item->unit_price,
                    'total_price' => (float) $item->total_price,
                ];
            })),
            'duplicate_of_id'    => $this->duplicate_of_id,
            'duplicate_of'       => $this->whenLoaded('duplicateOf', fn() => [
                'reference' => $this->duplicateOf->reference
            ]),
            'created_at'         => $this->created_at?->toIso8601String(),
            'updated_at'         => $this->updated_at?->toIso8601String(),
        ];
    }
}
