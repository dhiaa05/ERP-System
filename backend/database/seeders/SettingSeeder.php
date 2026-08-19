<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SettingSeeder extends Seeder
{
    public function run(): void
    {
        $settings = [
            // Finance group
            [
                'key'         => 'dollar_rate',
                'value'       => '0.00',
                'type'        => 'decimal',
                'label'       => 'Taux de change Dollar (DZD)',
                'description' => 'Référence uniquement. N\'est pas utilisé dans les calculs de commandes.',
                'group'       => 'finance',
            ],
            [
                'key'         => 'confirmation_employee_cost',
                'value'       => '0.00',
                'type'        => 'decimal',
                'label'       => 'Coût employé de confirmation (DZD/commande)',
                'description' => 'Coût par commande confirmée attribué à l\'employé de confirmation.',
                'group'       => 'finance',
            ],
            [
                'key'         => 'bag_cost',
                'value'       => '0.00',
                'type'        => 'decimal',
                'label'       => 'Coût sachet (DZD)',
                'description' => 'Coût unitaire du sachet d\'emballage.',
                'group'       => 'finance',
            ],
            [
                'key'         => 'printer_cost',
                'value'       => '0.00',
                'type'        => 'decimal',
                'label'       => 'Coût impression (DZD/étiquette)',
                'description' => 'Coût par étiquette imprimée.',
                'group'       => 'finance',
            ],
            [
                'key'         => 'transport_cost',
                'value'       => '0.00',
                'type'        => 'decimal',
                'label'       => 'Coût transport (DZD)',
                'description' => 'Coût de transport mensuel.',
                'group'       => 'finance',
            ],
            [
                'key'         => 'monthly_internet',
                'value'       => '0.00',
                'type'        => 'decimal',
                'label'       => 'Internet mensuel (DZD)',
                'description' => 'Abonnement internet mensuel.',
                'group'       => 'finance',
            ],
            [
                'key'         => 'monthly_flexy',
                'value'       => '0.00',
                'type'        => 'decimal',
                'label'       => 'Flexy mensuel (DZD)',
                'description' => 'Budget flexy mensuel.',
                'group'       => 'finance',
            ],
            [
                'key'         => 'other_fixed_costs',
                'value'       => '0.00',
                'type'        => 'decimal',
                'label'       => 'Autres charges fixes (DZD)',
                'description' => 'Autres charges fixes mensuelles non catégorisées.',
                'group'       => 'finance',
            ],

            // Performance score weights
            [
                'key'         => 'perf_weight_delivery_rate',
                'value'       => '0.35',
                'type'        => 'decimal',
                'label'       => 'Poids : Taux de livraison',
                'description' => 'Poids du taux de livraison dans le score de performance (0.0 à 1.0). Défaut: 35%.',
                'group'       => 'performance',
            ],
            [
                'key'         => 'perf_weight_confirmation_rate',
                'value'       => '0.20',
                'type'        => 'decimal',
                'label'       => 'Poids : Taux de confirmation',
                'description' => 'Poids du taux de confirmation dans le score de performance. Défaut: 20%.',
                'group'       => 'performance',
            ],
            [
                'key'         => 'perf_weight_avg_profit',
                'value'       => '0.20',
                'type'        => 'decimal',
                'label'       => 'Poids : Profit moyen par commande',
                'description' => 'Poids du profit moyen par commande livrée. Défaut: 20%.',
                'group'       => 'performance',
            ],
            [
                'key'         => 'perf_weight_net_profit',
                'value'       => '0.15',
                'type'        => 'decimal',
                'label'       => 'Poids : Profit net total',
                'description' => 'Poids du profit net total généré. Défaut: 15%.',
                'group'       => 'performance',
            ],
            [
                'key'         => 'perf_weight_low_refusal',
                'value'       => '0.05',
                'type'        => 'decimal',
                'label'       => 'Poids : Faible taux de refus',
                'description' => 'Poids du faible taux de refus (inversé). Défaut: 5%.',
                'group'       => 'performance',
            ],
            [
                'key'         => 'perf_weight_low_return',
                'value'       => '0.05',
                'type'        => 'decimal',
                'label'       => 'Poids : Faible taux de retour',
                'description' => 'Poids du faible taux de retour (inversé). Défaut: 5%.',
                'group'       => 'performance',
            ],
        ];

        foreach ($settings as $setting) {
            DB::table('settings')->updateOrInsert(
                ['key' => $setting['key']],
                array_merge($setting, [
                    'created_at' => now(),
                    'updated_at' => now(),
                ])
            );
        }
    }
}
