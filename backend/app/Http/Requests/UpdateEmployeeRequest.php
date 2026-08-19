<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateEmployeeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name'      => 'sometimes|required|string|max:100',
            'phone'     => 'nullable|string|max:20',
            'role'      => 'sometimes|required|in:admin,confirmation,delivery,other',
            'is_active' => 'boolean',
            'salary'    => 'nullable|numeric|min:0',
            'commission_per_delivered' => 'nullable|numeric|min:0',
            'hire_date' => 'nullable|date',
            'notes'     => 'nullable|string',
        ];
    }
}
