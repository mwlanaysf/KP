<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\KategoriBuku;

class KategoriBukuSeeder extends Seeder
{
    /**
     * Seed data kategori buku default.
     * Menggunakan firstOrCreate agar aman dijalankan berulang tanpa duplikat.
     */
    public function run(): void
    {
        $categories = [
            'Pelajaran',
            'Novel',
            'Referensi',
            'Teknologi',
            'Biografi',
            'Sejarah',
            'Agama',
            'Ensiklopedia',
            'Majalah', 'Cerpen', 'Komik', 'Sastra',
            'Lainnya',
        ];

        foreach ($categories as $name) {
            KategoriBuku::firstOrCreate(['nama' => $name]);
        }

        $this->command->info('✅ ' . count($categories) . ' kategori buku berhasil ditambahkan.');
    }
}
