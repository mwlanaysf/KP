<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\Anggota;
use App\Models\User;
use Carbon\Carbon;

class PeminjamanFactory extends Factory
{
    public function definition(): array
    {
        return [
            'kode_peminjaman' => fake()->unique()->numerify('PM####'),
            'anggota_id' => Anggota::factory(),
            'user_id' => User::factory(),
            'tanggal_pinjam' => Carbon::now()->format('Y-m-d'),
            'tanggal_kembali' => Carbon::now()->addDays(3)->format('Y-m-d'),
            'status' => 'Dipinjam',
        ];
    }
}
