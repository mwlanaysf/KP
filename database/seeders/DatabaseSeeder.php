<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 0. MASTER DATA
        $this->call(KategoriBukuSeeder::class);
        $this->call(JurusanSeeder::class);
        $this->call(HariLiburSeeder::class);
        $this->call(UserSeeder::class);

        // 1. AKUN DEFAULT (SUPER ADMIN, PETUGAS, KEPALA SEKOLAH)
        $defaultUsers = [
            [
                'username' => 'admin',
                'name'     => 'Ahmad Doni',
                'password' => Hash::make('admin'),
                'role'     => 'super_admin',
                'status'   => 'aktif',
            ],
            [
                'username' => 'petugas',
                'name'     => 'Nur Hidayah',
                'password' => Hash::make('petugas'),
                'role'     => 'admin',
                'status'   => 'aktif',
            ],
            [
                'username' => 'kepsek',
                'name'     => 'Kepala Sekolah',
                'password' => Hash::make('kepsek'),
                'role'     => 'kepala_sekolah',
                'status'   => 'aktif',
            ],
        ];

        foreach ($defaultUsers as $u) {
            DB::table('users')->updateOrInsert(
                ['username' => $u['username']],
                array_merge($u, ['created_at' => now(), 'updated_at' => now()])
            );
        }
    }
}