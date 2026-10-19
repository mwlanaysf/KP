<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Mengganti nama tabel dari 'pengaturan' ke 'pengaturan_peminjaman'.
     * Data existing dipertahankan — tidak ada drop/create.
     */
    public function up(): void
    {
        Schema::rename('pengaturan', 'pengaturan_peminjaman');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::rename('pengaturan_peminjaman', 'pengaturan');
    }
};
