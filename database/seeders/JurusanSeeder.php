<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Jurusan;

class JurusanSeeder extends Seeder
{
    /**
     * Seed data jurusan default.
     * Menggunakan firstOrCreate agar aman dijalankan berulang tanpa duplikat.
     */
    public function run(): void
    {
        $majors = [
            'TJKT',
            'AKL',
            'TBSM',
        ];

        foreach ($majors as $name) {
            Jurusan::firstOrCreate(['nama' => $name]);
        }

        $this->command->info('✅ ' . count($majors) . ' jurusan berhasil ditambahkan.');
    }
}
