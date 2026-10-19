<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Pengaturan;

class PengaturanSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        if (Pengaturan::count() == 0) {
            Pengaturan::create([
                'durasi_peminjaman' => 7,
                'maksimal_pinjam' => 3,
                'denda_per_hari' => 2000,
            ]);
        }
    }
}
