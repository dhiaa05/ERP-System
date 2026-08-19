<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ExpenseResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                    => $this->id,
            'date'                  => $this->date->format('Y-m-d'),
            'expense_category_id'   => $this->expense_category_id,
            'category_name'         => $this->whenLoaded('category', fn() => $this->category->name),
            'description'           => $this->description,
            'amount'                => (float) $this->amount,
            'created_at'            => $this->created_at?->toIso8601String(),
            'updated_at'            => $this->updated_at?->toIso8601String(),
        ];
    }
}
