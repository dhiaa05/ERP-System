<?php

namespace Database\Seeders;

use App\Models\AlertThreshold;
use Illuminate\Database\Seeder;

class AlertThresholdSeeder extends Seeder
{
    public function run(): void
    {
        $thresholds = [
            [
                'key' => 'delivery_rate_critical',
                'label' => 'Taux de Livraison',
                'description' => 'Alerte si le taux de livraison global passe sous les 60%',
                'metric' => 'delivery_rate',
                'operator' => 'lt',
                'threshold_value' => 60.00,
                'severity' => 'critical',
            ],
            [
                'key' => 'roas_warning',
                'label' => 'ROAS Global',
                'description' => 'Alerte si le retour sur investissement publicitaire (ROAS) tombe sous 2.0x',
                'metric' => 'roas',
                'operator' => 'lt',
                'threshold_value' => 2.00,
                'severity' => 'warning',
            ],
            [
                'key' => 'net_profit_negative',
                'label' => 'Bénéfice Net',
                'description' => 'Alerte critique si le bénéfice net tombe dans le rouge (< 0)',
                'metric' => 'net_profit',
                'operator' => 'lt',
                'threshold_value' => 0.00,
                'severity' => 'critical',
            ],
        ];

        foreach ($thresholds as $t) {
            AlertThreshold::updateOrCreate(['key' => $t['key']], $t);
        }
    }
}
