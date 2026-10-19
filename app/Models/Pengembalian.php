<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Pengembalian extends Model
{
    use HasFactory;

    protected $table = 'pengembalian';

    protected $fillable = [
        'peminjaman_id',
        'user_id',
        'tanggal_dikembalikan',
        'terlambat',
    ];

    // Relasi ke peminjaman
    public function peminjaman()
    {
        return $this->belongsTo(Peminjaman::class, 'peminjaman_id');
    }

    public function petugas()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    // Relasi ke denda
    public function denda()
    {
        return $this->hasOne(Denda::class, 'pengembalian_id');
    }
}


