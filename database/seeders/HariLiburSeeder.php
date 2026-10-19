<?php

namespace Database\Seeders;

use App\Models\HariLibur;
use Illuminate\Database\Seeder;

class HariLiburSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $nasionalHolidays = [
            ['date' => '2026-01-01', 'description' => 'Tahun Baru 2026 Masehi'],
            ['date' => '2026-02-18', 'description' => 'Isra Mikraj Nabi Muhammad SAW'],
            ['date' => '2026-03-03', 'description' => 'Hari Raya Nyepi Tahun Baru Saka 1948'],
            ['date' => '2026-03-20', 'description' => 'Hari Raya Idul Fitri 1447 Hijriah'],
            ['date' => '2026-03-21', 'description' => 'Hari Raya Idul Fitri 1447 Hijriah'],
            ['date' => '2026-04-03', 'description' => 'Wafat Isa Al Masih'],
            ['date' => '2026-05-01', 'description' => 'Hari Buruh Internasional'],
            ['date' => '2026-05-14', 'description' => 'Kenaikan Isa Al Masih'],
            ['date' => '2026-05-24', 'description' => 'Hari Raya Waisak 2570 BE'],
            ['date' => '2026-05-27', 'description' => 'Hari Raya Idul Adha 1447 Hijriah'],
            ['date' => '2026-06-01', 'description' => 'Hari Lahir Pancasila'],
            ['date' => '2026-06-16', 'description' => 'Tahun Baru Islam 1448 Hijriah'],
            ['date' => '2026-08-17', 'description' => 'Hari Kemerdekaan Republik Indonesia'],
            ['date' => '2026-08-25', 'description' => 'Maulid Nabi Muhammad SAW'],
            ['date' => '2026-12-25', 'description' => 'Hari Raya Natal'],
        ];

        foreach ($nasionalHolidays as $holiday) {
            HariLibur::firstOrCreate(
                ['tanggal' => $holiday['date']],
                [
                    'keterangan' => $holiday['description'],
                    'jenis_hari_libur' => 'nasional'
                ]
            );
        }
    }
}
