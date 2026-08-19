<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Product extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'sku',
        'category_id',
        'selling_price',
        'purchase_price',
        'purchase_cost',
        'is_active',
        'quantity_rules',
    ];

    protected $casts = [
        'selling_price'  => 'decimal:2',
        'purchase_price' => 'decimal:2',
        'is_active'      => 'boolean',
        'quantity_rules' => 'array',
    ];

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }
}
