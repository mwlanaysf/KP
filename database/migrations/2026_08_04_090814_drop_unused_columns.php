<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropUnique(['email']);
            $table->dropColumn(['email', 'email_verified_at', 'remember_token']);
        });

        Schema::table('anggota', function (Blueprint $table) {
            $table->dropColumn('email');
        });

        Schema::table('denda', function (Blueprint $table) {
            $table->dropForeign(['anggota_id']);
            $table->dropForeign(['peminjaman_id']);
            $table->dropColumn(['anggota_id', 'peminjaman_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (config('database.default') === 'sqlite') {
            return;
        }

        Schema::table('users', function (Blueprint $table) {
            $table->string('email')->unique()->nullable();
            $table->timestamp('email_verified_at')->nullable();
            $table->rememberToken();
        });

        Schema::table('anggota', function (Blueprint $table) {
            $table->string('email')->unique()->nullable();
        });

        Schema::table('denda', function (Blueprint $table) {
            $table->foreignId('anggota_id')->nullable()->constrained('anggota')->onDelete('cascade');
            $table->foreignId('peminjaman_id')->nullable()->constrained('peminjaman')->onDelete('cascade');
        });
    }
};
