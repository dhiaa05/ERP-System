<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreExpenseRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'date'                => 'required|date',
            'expense_category_id' => 'required|exists:expense_categories,id',
            'description'         => 'required|string|max:500',
            'amount'              => 'required|numeric|min:0',
        ];
    }
}
