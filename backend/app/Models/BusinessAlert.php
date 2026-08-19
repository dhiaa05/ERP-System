<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BusinessAlert extends Model
{
    protected $fillable = [
        'alert_threshold_id',
        'subject_type',
        'subject_id',
        'subject_label',
        'severity',
        'title',
        'description',
        'current_value',
        'threshold_value',
        'period_start',
        'period_end',
        'is_dismissed',
        'dismissed_by',
        'dismissed_at',
    ];

    protected $casts = [
        'is_dismissed' => 'boolean',
        'current_value' => 'decimal:4',
        'threshold_value' => 'decimal:4',
        'period_start' => 'date',
        'period_end' => 'date',
        'dismissed_at' => 'datetime',
    ];

    public function threshold()
    {
        return $this->belongsTo(AlertThreshold::class, 'alert_threshold_id');
    }
}
