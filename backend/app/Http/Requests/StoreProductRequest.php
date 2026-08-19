<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Authentication handled by middleware
    }

    protected function prepareForValidation()
    {
        if ($this->has('purchase_price')) {
            $this->merge([
                'purchase_cost' => $this->input('purchase_price')
            ]);
        }
    }

    public function rules(): array
    {
        return [
            'name'           => 'required|string|max:255',
            'sku'            => 'required|string|max:100|unique:products,sku',
            'category_id'    => 'nullable|exists:categories,id',
            'selling_price'  => 'required|numeric|min:0',
            'purchase_price' => 'required|numeric|min:0',
            'purchase_cost'  => 'required|numeric|min:0',
            'is_active'      => 'boolean',
            'quantity_rules' => 'nullable|array',
        ];
    }
}
