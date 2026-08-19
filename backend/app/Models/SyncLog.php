<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SyncLog extends Model
{
    protected $fillable = [
        'sync_source_id',
        'started_at',
        'completed_at',
        'status',
        'rows_total',
        'rows_created',
        'rows_updated',
        'rows_skipped',
        'rows_failed',
        'errors',
        'triggered_by'
    ];

    public function syncSource()
    {
        return $this->belongsTo(SyncSource::class);
    }
}
