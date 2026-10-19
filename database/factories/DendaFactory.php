<?php

namespace Database\Factories;

use App\Models\Denda;
use App\Models\Peminjaman;
use App\Models\Pengembalian;
use App\Models\Anggota;
use Illuminate\Database\Eloquent\Factories\Factory;

class DendaFactory extends Factory
{
    public function definition(): array
    {
        return [
            'pengembalian_id' => Pengembalian::factory(),
            'nominal_per_hari' => 2000,
            'total_denda' => 2000,
            'status_bayar' => 'Belum Lunas',
        ];
    }
}
