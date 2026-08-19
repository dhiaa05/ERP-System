<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateCampaignRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name'           => 'sometimes|required|string|max:200',
            'product_id'     => 'sometimes|required|exists:products,id',
            'date'           => 'sometimes|required|date',
            'facebook_spend' => 'sometimes|required|numeric|min:0',
            'spend_usd'      => 'nullable|numeric|min:0',
            'exchange_rate'  => 'nullable|numeric|min:0',
            'leads'          => 'sometimes|required|integer|min:0',
            'notes'          => 'nullable|string',
            'external_id'    => 'nullable|string|max:100',
        ];
    }
}
