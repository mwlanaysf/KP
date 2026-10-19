<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pengembalian', function (Blueprint $table) {
            $table->id();

            // Relasi ke peminjaman dan denda
            $table->foreignId('peminjaman_id')
                ->constrained('peminjaman')
                ->restrictOnDelete();

            $table->date('tanggal_dikembalikan')->nullable();
            $table->integer('terlambat')->nullable(); // jumlah hari terlambat

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pengembalian');
    }
};
