<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Setting extends Model
{
    use HasFactory;
    
    protected $fillable = ['key', 'value'];
    
    // Auto-cast value if it looks like JSON or bool
    public function getValueAttribute($value)
    {
        if ($value === 'true') return true;
        if ($value === 'false') return false;
        return $value;
    }
}
