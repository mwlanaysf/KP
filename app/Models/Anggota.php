<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Anggota extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'anggota';

    protected $fillable = [
        'kode_anggota',
        'nama',
        'jurusan_id',
        'kelas',
        'no_hp',
        'alamat',
    ];

    // Relasi: 1 anggota bisa memiliki banyak peminjaman
    public function peminjaman()
    {
        return $this->hasMany(Peminjaman::class, 'anggota_id');
    }

    public function jurusan()
    {
        return $this->belongsTo(Jurusan::class, 'jurusan_id');
    }
}
