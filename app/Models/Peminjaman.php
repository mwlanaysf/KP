<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Peminjaman extends Model
{
    use HasFactory;

    protected $table = 'peminjaman';

    protected $fillable = [
        'kode_peminjaman',   // ← TAMBAHKAN INI
        'anggota_id',
        'user_id',
        'tanggal_pinjam',
        'tanggal_kembali',
        'status',
    ];

    // Relasi ke anggota
    public function anggota()
    {
        return $this->belongsTo(Anggota::class, 'anggota_id')->withTrashed();
    }

    public function petugas()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    // Relasi ke detail peminjaman
    public function detail_peminjaman()
    {
        return $this->hasMany(DetailPeminjaman::class, 'peminjaman_id');
    }

    // Relasi buku
    public function buku()
    {
        return $this->hasManyThrough(
            Buku::class,
            DetailPeminjaman::class,
            'peminjaman_id',
            'id',
            'id',
            'buku_id'
        );
    }

    // Relasi pengembalian
    public function pengembalian()
    {
        return $this->hasOne(Pengembalian::class, 'peminjaman_id');
    }

    // Relasi denda
    public function denda()
    {
        return $this->hasOne(Denda::class, 'peminjaman_id');
    }
}


