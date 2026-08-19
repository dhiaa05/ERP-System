<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Insight extends Model
{
    protected $fillable = [
        'type',
        'subject_type',
        'subject_id',
        'period_start',
        'period_end',
        'text',
        'data',
        'is_read',
    ];

    protected $casts = [
        'period_start' => 'date',
        'period_end' => 'date',
        'data' => 'array',
        'is_read' => 'boolean',
    ];
}
