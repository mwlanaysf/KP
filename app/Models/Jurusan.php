<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

use Illuminate\Database\Eloquent\Factories\HasFactory;

class Jurusan extends Model
{
    use HasFactory;
    protected $table = 'jurusan';
    protected $fillable = ['nama'];

    public function anggota()
    {
        return $this->hasMany(Anggota::class, 'jurusan_id');
    }
}


