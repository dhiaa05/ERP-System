<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

/**
 * Seeds major commune capitals per wilaya.
 * Full commune list can be imported later via CSV.
 * These are the most commonly used communes for COD delivery.
 */
class CommuneSeeder extends Seeder
{
    public function run(): void
    {
        $communes = [
            // Wilaya 16 — Alger
            ['wilaya_id' => 16, 'name_ar' => 'الجزائر الوسطى',    'name_fr' => 'Alger Centre'],
            ['wilaya_id' => 16, 'name_ar' => 'باب الزوار',          'name_fr' => 'Bab Ezzouar'],
            ['wilaya_id' => 16, 'name_ar' => 'بابا حسن',            'name_fr' => 'Baba Hassen'],
            ['wilaya_id' => 16, 'name_ar' => 'بئر مراد رايس',       'name_fr' => 'Bir Mourad Raïs'],
            ['wilaya_id' => 16, 'name_ar' => 'بوزريعة',             'name_fr' => 'Bouzaréah'],
            ['wilaya_id' => 16, 'name_ar' => 'حيدرة',               'name_fr' => 'Hydra'],
            ['wilaya_id' => 16, 'name_ar' => 'الحراش',              'name_fr' => 'El Harrach'],
            ['wilaya_id' => 16, 'name_ar' => 'الدرارية',            'name_fr' => 'Draria'],
            ['wilaya_id' => 16, 'name_ar' => 'دار البيضاء',         'name_fr' => 'Dar El Beïda'],
            ['wilaya_id' => 16, 'name_ar' => 'خرايسية',             'name_fr' => 'Khraicia'],
            ['wilaya_id' => 16, 'name_ar' => 'المحمدية',            'name_fr' => 'Mohammadia'],
            ['wilaya_id' => 16, 'name_ar' => 'المرادية',            'name_fr' => 'El Mouradia'],
            ['wilaya_id' => 16, 'name_ar' => 'الرويسية',            'name_fr' => 'Rouiba'],
            ['wilaya_id' => 16, 'name_ar' => 'سيدي عبد الله',       'name_fr' => 'Sidi Abdallah'],
            ['wilaya_id' => 16, 'name_ar' => 'برج البحري',          'name_fr' => 'Bordj El Bahri'],
            ['wilaya_id' => 16, 'name_ar' => 'القبة',               'name_fr' => 'El Qobbah'],
            ['wilaya_id' => 16, 'name_ar' => 'شراقة',               'name_fr' => 'Cheraga'],
            ['wilaya_id' => 16, 'name_ar' => 'بن عكنون',            'name_fr' => 'Ben Aknoun'],

            // Wilaya 31 — Oran
            ['wilaya_id' => 31, 'name_ar' => 'وهران',               'name_fr' => 'Oran'],
            ['wilaya_id' => 31, 'name_ar' => 'سيدي الشحمي',         'name_fr' => 'Sidi El Chami'],
            ['wilaya_id' => 31, 'name_ar' => 'بئر الجير',           'name_fr' => 'Bir El Djir'],
            ['wilaya_id' => 31, 'name_ar' => 'مرسى الكبير',         'name_fr' => 'Mers El Kébir'],
            ['wilaya_id' => 31, 'name_ar' => 'عين الترك',           'name_fr' => 'Aïn El Turk'],

            // Wilaya 25 — Constantine
            ['wilaya_id' => 25, 'name_ar' => 'قسنطينة',             'name_fr' => 'Constantine'],
            ['wilaya_id' => 25, 'name_ar' => 'الخروب',              'name_fr' => 'El Khroub'],
            ['wilaya_id' => 25, 'name_ar' => 'حامة بوزيان',         'name_fr' => 'Hamma Bouziane'],
            ['wilaya_id' => 25, 'name_ar' => 'عين عبيد',            'name_fr' => 'Aïn Abid'],
            ['wilaya_id' => 25, 'name_ar' => 'ديدوش مراد',          'name_fr' => 'Didouche Mourad'],

            // Wilaya 5 — Batna
            ['wilaya_id' => 5,  'name_ar' => 'باتنة',               'name_fr' => 'Batna'],
            ['wilaya_id' => 5,  'name_ar' => 'تازولت',              'name_fr' => 'Tazoult'],

            // Wilaya 9 — Blida
            ['wilaya_id' => 9,  'name_ar' => 'البليدة',             'name_fr' => 'Blida'],
            ['wilaya_id' => 9,  'name_ar' => 'أولاد يعيش',          'name_fr' => 'Ouled Yaïch'],
            ['wilaya_id' => 9,  'name_ar' => 'بوفاريك',             'name_fr' => 'Boufarik'],
            ['wilaya_id' => 9,  'name_ar' => 'مفتاح',               'name_fr' => 'Meftah'],

            // Wilaya 35 — Boumerdès
            ['wilaya_id' => 35, 'name_ar' => 'بومرداس',             'name_fr' => 'Boumerdès'],
            ['wilaya_id' => 35, 'name_ar' => 'بودواو',              'name_fr' => 'Boudouaou'],
            ['wilaya_id' => 35, 'name_ar' => 'الثنية',              'name_fr' => 'Thenia'],

            // Wilaya 42 — Tipaza
            ['wilaya_id' => 42, 'name_ar' => 'تيبازة',              'name_fr' => 'Tipaza'],
            ['wilaya_id' => 42, 'name_ar' => 'حجوط',                'name_fr' => 'Hadjout'],
            ['wilaya_id' => 42, 'name_ar' => 'مسلمون',              'name_fr' => 'Mahelma'],

            // Wilaya 15 — Tizi Ouzou
            ['wilaya_id' => 15, 'name_ar' => 'تيزي وزو',            'name_fr' => 'Tizi Ouzou'],
            ['wilaya_id' => 15, 'name_ar' => 'ذراع بن خدة',         'name_fr' => 'Draa Ben Khedda'],
            ['wilaya_id' => 15, 'name_ar' => 'تيزي غنيف',           'name_fr' => 'Tizi Ghénif'],

            // Wilaya 6 — Béjaïa
            ['wilaya_id' => 6,  'name_ar' => 'بجاية',               'name_fr' => 'Béjaïa'],
            ['wilaya_id' => 6,  'name_ar' => 'أقبو',                'name_fr' => 'Akbou'],

            // Wilaya 19 — Sétif
            ['wilaya_id' => 19, 'name_ar' => 'سطيف',                'name_fr' => 'Sétif'],
            ['wilaya_id' => 19, 'name_ar' => 'عين أولمان',          'name_fr' => 'Aïn Oulmane'],
            ['wilaya_id' => 19, 'name_ar' => 'العلمة',              'name_fr' => 'El Eulma'],

            // Wilaya 23 — Annaba
            ['wilaya_id' => 23, 'name_ar' => 'عنابة',               'name_fr' => 'Annaba'],
            ['wilaya_id' => 23, 'name_ar' => 'البوني',              'name_fr' => 'El Bouni'],

            // Wilaya 26 — Médéa
            ['wilaya_id' => 26, 'name_ar' => 'المدية',              'name_fr' => 'Médéa'],
            ['wilaya_id' => 26, 'name_ar' => 'كاف لخضر',           'name_fr' => 'Kaf Lakhdar'],

            // Wilaya 27 — Mostaganem
            ['wilaya_id' => 27, 'name_ar' => 'مستغانم',             'name_fr' => 'Mostaganem'],

            // Wilaya 13 — Tlemcen
            ['wilaya_id' => 13, 'name_ar' => 'تلمسان',              'name_fr' => 'Tlemcen'],
            ['wilaya_id' => 13, 'name_ar' => 'المنصورة',            'name_fr' => 'Mansourah'],

            // Wilaya 34 — Bordj Bou Arréridj
            ['wilaya_id' => 34, 'name_ar' => 'برج بوعريريج',        'name_fr' => 'Bordj Bou Arréridj'],

            // Wilaya 7 — Biskra
            ['wilaya_id' => 7,  'name_ar' => 'بسكرة',               'name_fr' => 'Biskra'],

            // Wilaya 30 — Ouargla
            ['wilaya_id' => 30, 'name_ar' => 'ورقلة',               'name_fr' => 'Ouargla'],
            ['wilaya_id' => 30, 'name_ar' => 'حاسي مسعود',          'name_fr' => 'Hassi Messaoud'],
        ];

        foreach ($communes as $commune) {
            DB::table('communes')->insert(array_merge($commune, [
                'created_at' => now(),
                'updated_at' => now(),
            ]));
        }
    }
}
