<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
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
            'name'           => 'sometimes|required|string|max:255',
            'sku'            => 'sometimes|required|string|max:100|unique:products,sku,' . $this->route('product')->id,
            'category_id'    => 'nullable|exists:categories,id',
            'selling_price'  => 'sometimes|required|numeric|min:0',
            'purchase_price' => 'sometimes|required|numeric|min:0',
            'purchase_cost'  => 'sometimes|required|numeric|min:0',
            'is_active'      => 'boolean',
            'quantity_rules' => 'nullable|array',
        ];
    }
}
