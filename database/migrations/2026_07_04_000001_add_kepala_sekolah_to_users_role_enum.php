<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // MySQL requires ALTER TABLE to modify enum
        if (DB::connection()->getDriverName() !== 'sqlite') { DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('super_admin', 'admin', 'kepala_sekolah') NOT NULL DEFAULT 'admin'"); }
    }

    public function down(): void
    {
        // Revert: update any kepala_sekolah back to admin first
        DB::table('users')->where('role', 'kepala_sekolah')->update(['role' => 'admin']);
        DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('super_admin', 'admin') NOT NULL DEFAULT 'admin'");
    }
};
