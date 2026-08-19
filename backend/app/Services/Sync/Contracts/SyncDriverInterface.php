<?php

namespace App\Services\Sync\Contracts;

use App\Models\SyncSource;
use Illuminate\Support\Collection;

interface SyncDriverInterface
{
    /**
     * Fetch raw data from the external source.
     * 
     * @param SyncSource $source The configuration for this source
     * @param array $options Additional options (e.g. file path for CSV upload)
     * @return Collection A collection of associative arrays representing raw rows
     */
    public function fetch(SyncSource $source, array $options = []): Collection;
}
