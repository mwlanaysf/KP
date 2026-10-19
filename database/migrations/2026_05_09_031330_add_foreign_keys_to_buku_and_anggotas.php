<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('buku', function (Blueprint $table) {
            $table->dropColumn('kategori');
            $table->foreignId('kategori_id')->nullable()->constrained('kategori_buku')->restrictOnDelete();
        });

        Schema::table('anggota', function (Blueprint $table) {
            $table->dropColumn('kelas');
            $table->foreignId('jurusan_id')->nullable()->constrained('jurusan')->restrictOnDelete();
            $table->foreignId('class_id')->nullable()->constrained('student_classes')->restrictOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('buku', function (Blueprint $table) {
            $table->dropForeign(['kategori_id']);
            $table->dropColumn('kategori_id');
            $table->string('kategori')->nullable();
        });

        Schema::table('anggota', function (Blueprint $table) {
            $table->dropForeign(['jurusan_id']);
            $table->dropForeign(['class_id']);
            $table->dropColumn(['jurusan_id', 'class_id']);
            $table->string('kelas')->nullable();
        });
    }
};
