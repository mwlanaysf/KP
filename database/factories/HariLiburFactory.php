<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class HariLiburFactory extends Factory
{
    public function definition(): array
    {
        return [
            'tanggal' => fake()->date(),
            'keterangan' => fake()->sentence(),
            'jenis_hari_libur' => fake()->randomElement(['Nasional', 'Sekolah', 'Lainnya']),
        ];
    }
}
