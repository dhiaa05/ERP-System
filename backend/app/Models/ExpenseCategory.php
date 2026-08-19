<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ExpenseCategory extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'description',
        'is_system',
    ];

    protected $casts = [
        'is_system' => 'boolean',
    ];

    public function expenses()
    {
        return $this->hasMany(Expense::class);
    }
}
