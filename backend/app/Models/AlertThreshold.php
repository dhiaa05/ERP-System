<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AlertThreshold extends Model
{
    protected $fillable = [
        'key',
        'label',
        'description',
        'metric',
        'operator',
        'threshold_value',
        'is_active',
        'severity',
        'updated_by',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'threshold_value' => 'decimal:4',
    ];
}
