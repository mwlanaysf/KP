<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Pengaturan extends Model
{
    use HasFactory;

    protected $table = 'pengaturan_peminjaman';

    protected $fillable = [
        'durasi_peminjaman',
        'maksimal_pinjam',
        'denda_per_hari',
    ];
}
