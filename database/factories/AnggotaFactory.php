<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\Jurusan;

class AnggotaFactory extends Factory
{
    public function definition(): array
    {
        return [
            'kode_anggota' => fake()->unique()->numerify('AG####'),
            'nama' => fake()->name(),
            'no_hp' => fake()->phoneNumber(),
            'alamat' => fake()->address(),
            'kelas' => fake()->randomElement(['X', 'XI', 'XII']),
            'jurusan_id' => Jurusan::factory(),
        ];
    }
}
