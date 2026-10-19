<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Buku extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'buku';

    protected $fillable = [
        'kode_buku',
        'judul',
        'pengarang',
        'kategori_id',
        'penerbit',
        'tahun_terbit',
        'stok',
    ];

    // Relasi: 1 buku bisa dipinjam berkali-kali
    public function peminjaman()
    {
        return $this->hasMany(Peminjaman::class, 'buku_id');
    }

    public function detail_peminjaman()
    {
        return $this->hasMany(DetailPeminjaman::class, 'buku_id');
    }

    public function kategori()
    {
        return $this->belongsTo(KategoriBuku::class, 'kategori_id');
    }
}



