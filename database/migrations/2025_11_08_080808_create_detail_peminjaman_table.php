<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Hapus foreign key buku_id dari tabel peminjaman
        Schema::table('peminjaman', function (Blueprint $table) {
            $table->dropForeign(['buku_id']);
            $table->dropColumn('buku_id');
        });

        // Buat tabel detail_peminjaman
        Schema::create('detail_peminjaman', function (Blueprint $table) {
            $table->id();
            $table->foreignId('peminjaman_id')
                ->constrained('peminjaman')
                ->onDelete('cascade');
            $table->foreignId('buku_id')
                ->constrained('buku')
                ->restrictOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('detail_peminjaman');

        // Kembalikan buku_id ke tabel peminjaman
        Schema::table('peminjaman', function (Blueprint $table) {
            $table->foreignId('buku_id')
                ->constrained('buku')
                ->restrictOnDelete();
        });
    }
};
