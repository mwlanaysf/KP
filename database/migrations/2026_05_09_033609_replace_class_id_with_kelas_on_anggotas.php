<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('anggota', function (Blueprint $table) {
            // Hapus foreign key class_id jika ada
            if (Schema::hasColumn('anggota', 'class_id')) {
                $table->dropForeign(['class_id']);
                $table->dropColumn('class_id');
            }
            // Tambah kolom kelas string (hardcoded: X, XI, XII)
            if (!Schema::hasColumn('anggota', 'kelas')) {
                $table->string('kelas', 10)->nullable()->after('jurusan_id');
            }
        });
    }

    public function down(): void
    {
        Schema::table('anggota', function (Blueprint $table) {
            if (Schema::hasColumn('anggota', 'kelas')) {
                $table->dropColumn('kelas');
            }
            if (!Schema::hasColumn('anggota', 'class_id')) {
                $table->foreignId('class_id')->nullable()->constrained('student_classes')->restrictOnDelete();
            }
        });
    }
};
