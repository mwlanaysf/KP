<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('anggota', function (Blueprint $table) {
            $table->id();
            $table->string('kode_anggota')->unique();
            $table->string('nama');
            $table->string('kelas')->nullable(); // ← tambahkan di sini
            $table->string('email')->nullable();
            $table->string('no_hp')->nullable();
            $table->text('alamat')->nullable();
            $table->softDeletes();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('anggota');
    }
};
