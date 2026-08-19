<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Employee extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'phone',
        'role',
        'is_active',
        'salary',
        'commission_per_delivered',
        'hire_date',
        'notes',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'is_active'                => 'boolean',
        'salary'                   => 'decimal:2',
        'commission_per_delivered' => 'decimal:2',
        'hire_date'                => 'date',
    ];

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updater()
    {
        return $this->belongsTo(User::class, 'updated_by');
    }
}
