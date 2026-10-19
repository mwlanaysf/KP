<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\Buku;
use App\Models\KategoriBuku;

class BukuFactory extends Factory
{
    public function definition(): array
    {
        return [
            'kode_buku' => fake()->unique()->numerify('BK####'),
            'judul' => fake()->sentence(3),
            'pengarang' => fake()->name(),
            'penerbit' => fake()->company(),
            'tahun_terbit' => fake()->year(),
            'kategori_id' => KategoriBuku::factory(),
            'stok' => 5,
        ];
    }

    public function habis(): static
    {
        return $this->state(fn (array $attributes) => [
            'stok' => 0,
        ]);
    }
}
