<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreCampaignRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name'           => 'required|string|max:200',
            'product_id'     => 'required|exists:products,id',
            'date'           => 'required|date',
            'facebook_spend' => 'required|numeric|min:0',
            'spend_usd'      => 'nullable|numeric|min:0',
            'exchange_rate'  => 'nullable|numeric|min:0',
            'leads'          => 'required|integer|min:0',
            'notes'          => 'nullable|string',
            'external_id'    => 'nullable|string|max:100',
        ];
    }
}
