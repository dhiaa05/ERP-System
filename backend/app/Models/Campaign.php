<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Campaign extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'product_id',
        'date',
        'facebook_spend',
        'spend_usd',
        'exchange_rate',
        'leads',
        'notes',
        'external_id',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'date'           => 'date',
        'facebook_spend' => 'decimal:2',
        'spend_usd'      => 'decimal:2',
        'exchange_rate'  => 'decimal:2',
    ];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
