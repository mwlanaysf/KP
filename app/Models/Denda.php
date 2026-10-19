<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Denda extends Model
{
    use HasFactory;

    protected $table = 'denda';

    protected $fillable = [
        'pengembalian_id',
        'nominal_per_hari',
        'total_denda',
        'status_bayar',
    ];

    // Relasi ke pengembalian (satu-satunya FK langsung di tabel denda)
    public function pengembalian()
    {
        return $this->belongsTo(Pengembalian::class, 'pengembalian_id');
    }

    // Shortcut helper: akses peminjaman via pengembalian
    public function getPeminjamanAttribute()
    {
        return $this->pengembalian?->peminjaman;
    }


}
