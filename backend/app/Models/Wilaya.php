<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Wilaya extends Model
{
    protected $fillable = [
        'code',
        'name_ar',
        'name_fr',
        'real_shipping_cost_home',
        'real_shipping_cost_desk',
        'return_cost',
    ];

    protected $casts = [
        'real_shipping_cost_home' => 'decimal:2',
        'real_shipping_cost_desk' => 'decimal:2',
        'return_cost' => 'decimal:2',
    ];
}
