<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Order extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'reference',
        'external_reference',
        'order_date',
        'customer_name',
        'customer_phone',
        'wilaya_id',
        'commune_id',
        'campaign_id',
        'carrier_id',
        'confirmed_by',
        'tracking_number',
        'status',
        'total_amount',
        'sync_source_id',
        'sync_metadata',
        'notes',
        'created_by',
        'updated_by',
        'ordered_at',
        'duplicate_of_id',
        'shipping_fee',
        'total_amount',
        'customer_address',
        'carrier_shipping_cost',
        'carrier_return_cost',
    ];

    protected $casts = [
        'order_date' => 'date',
        'ordered_at' => 'datetime',
        'sync_metadata' => 'array',
    ];

    public function wilaya()
    {
        return $this->belongsTo(Wilaya::class);
    }

    public function commune()
    {
        return $this->belongsTo(Commune::class);
    }

    public function campaign()
    {
        return $this->belongsTo(Campaign::class);
    }

    public function carrier()
    {
        return $this->belongsTo(Carrier::class);
    }

    public function confirmedBy()
    {
        return $this->belongsTo(Employee::class, 'confirmed_by');
    }

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function statusHistories()
    {
        return $this->hasMany(OrderStatusHistory::class);
    }

    public function syncSource()
    {
        return $this->belongsTo(SyncSource::class);
    }
    
    public function duplicateOf()
    {
        return $this->belongsTo(Order::class, 'duplicate_of_id');
    }
}
