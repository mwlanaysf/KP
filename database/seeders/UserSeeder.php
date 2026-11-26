<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $users = [
            [
                'name' => 'Super Admin',
                'username' => 'superadmin',
                'password' => Hash::make('superadmin'),
                'role' => 'super_admin',
                'status' => 'aktif', // sesuaikan jika kolom status bertipe boolean (true) atau string ('aktif')
            ],
            [
                'name' => 'Admin Perpustakaan',
                'username' => 'admin',
                'password' => Hash::make('admin'),
                'role' => 'admin',
                'status' => 'aktif',
            ],
            [
                'name' => 'Kepala Sekolah',
                'username' => 'kepalasekolah',
                'password' => Hash::make('kepalasekolah'),
                'role' => 'kepala_sekolah',
                'status' => 'aktif',
            ],
        ];

        foreach ($users as $user) {
            User::updateOrCreate(
                ['username' => $user['username']],
                $user
            );
        }
    }
}