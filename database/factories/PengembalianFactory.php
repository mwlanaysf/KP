<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\Peminjaman;
use App\Models\User;
use Carbon\Carbon;

class PengembalianFactory extends Factory
{
    public function definition(): array
    {
        return [
            'peminjaman_id' => Peminjaman::factory(),
            'user_id' => User::factory(),
            'tanggal_dikembalikan' => Carbon::now()->format('Y-m-d'),
            'terlambat' => 0,
        ];
    }
}
