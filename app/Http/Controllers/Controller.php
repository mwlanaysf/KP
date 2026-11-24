<?php

namespace App\Http\Controllers;

use Illuminate\Database\Eloquent\SoftDeletes;

abstract class Controller
{
    /**
     * Hasilkan kode berurut berikutnya yang dijamin unik, termasuk memeriksa data soft-delete.
     */
    protected function nextSequentialCode(string $modelClass, string $column, string $prefix, int $minDigits = 3): string
    {
        $usesSoftDeletes = in_array(SoftDeletes::class, class_uses_recursive($modelClass), true);
        $baseQuery = fn () => $usesSoftDeletes ? $modelClass::withTrashed() : $modelClass::query();

        $existing = $baseQuery()->where($column, 'like', $prefix . '%')->pluck($column);

        $maxNum = 0;
        $padLen = $minDigits;
        $pattern = '/^' . preg_quote($prefix, '/') . '(\d+)$/';

        foreach ($existing as $code) {
            if (preg_match($pattern, (string) $code, $m)) {
                $num = (int) $m[1];
                if ($num > $maxNum) {
                    $maxNum = $num;
                    $padLen = max($minDigits, strlen($m[1]));
                }
            }
        }

        $next = $maxNum + 1;
        do {
            $candidate = $prefix . str_pad((string) $next, $padLen, '0', STR_PAD_LEFT);
            $next++;
        } while ($baseQuery()->where($column, $candidate)->exists());

        return $candidate;
    }
}
