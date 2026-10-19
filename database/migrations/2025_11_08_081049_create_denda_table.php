<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('denda', function (Blueprint $table) {
            $table->id();
            $table->foreignId('peminjaman_id')
                ->constrained('peminjaman')
                ->restrictOnDelete();
            
            $table->foreignId('anggota_id')
                ->constrained('anggota')
                ->restrictOnDelete();
                
            $table->foreignId('pengembalian_id')
                ->constrained('pengembalian')
                ->restrictOnDelete();

            $table->decimal('nominal_per_hari', 10, 2)->default(0);
            $table->decimal('total_denda', 10, 2)->default(0);
            // Ganti ENUM menjadi STRING agar fleksibel dan tidak error di SQLite/MySQL
            $table->string('status_bayar', 20)->default('Belum Lunas');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('denda');
    }
};
