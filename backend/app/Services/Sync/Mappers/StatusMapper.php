<?php

namespace App\Services\Sync\Mappers;

use App\Models\SyncSource;

class StatusMapper
{
    /**
     * Maps raw string status to internal enum status.
     *
     * @param SyncSource $source
     * @param string|null $rawStatus
     * @return string
     */
    public function mapStatus(SyncSource $source, ?string $rawStatus): string
    {
        if (empty($rawStatus)) {
            return 'pending'; // Default fallback
        }

        // Standardize string comparison
        $rawStatusKey = mb_strtolower(trim($rawStatus), 'UTF-8');

        // MVP uses standard defaults
        $mappingsCache = [];
        $mappings = [
            'livrÃ©' => 'delivered',
            'livré' => 'delivered',
            'livre' => 'delivered',
            'delivered' => 'delivered',
            
            'annulÃ©' => 'cancelled',
            'annulé' => 'cancelled',
            'annule' => 'cancelled',
            'cancelled' => 'cancelled',
            
            'en cours' => 'processing',
            'processing' => 'processing',
            
            'retour' => 'returned',
            'returned' => 'returned',
            
            'confirmÃ©' => 'confirmed',
            'confirme' => 'confirmed',
            'confirmed' => 'confirmed',

            'sent' => 'sent',
            'expedié' => 'sent',
            'expédié' => 'sent',
            'expedie' => 'sent',
            
            'pending' => 'pending',
            'created' => 'pending',
            'nouveau' => 'pending',
        ];

        // If mapped, return internal status. Else, default to pending.
        return $mappings[$rawStatusKey] ?? 'pending';
    }
}
