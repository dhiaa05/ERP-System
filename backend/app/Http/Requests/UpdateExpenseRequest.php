<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateExpenseRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'date'                => 'sometimes|required|date',
            'expense_category_id' => 'sometimes|required|exists:expense_categories,id',
            'description'         => 'sometimes|required|string|max:500',
            'amount'              => 'sometimes|required|numeric|min:0',
        ];
    }
}
