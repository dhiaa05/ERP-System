<?php

namespace App\Services\Sync\Resolvers;

use App\Models\Wilaya;
use App\Models\Commune;
use App\Models\Product;
use Illuminate\Support\Str;

class EntityResolverService
{
    private array $wilayaCache = [];
    private array $communeCache = [];
    private array $productCache = [];

    /**
     * Tries to find a Wilaya ID based on a string name.
     */
    public function resolveWilaya(?string $wilayaName): ?int
    {
        if (empty($wilayaName)) {
            return null;
        }

        $normalized = Str::slug($wilayaName);

        if (array_key_exists($normalized, $this->wilayaCache)) {
            return $this->wilayaCache[$normalized];
        }

        $wilaya = Wilaya::where('name_fr', 'like', "%{$wilayaName}%")
            ->orWhere('name_ar', 'like', "%{$wilayaName}%")
            ->first();

        $this->wilayaCache[$normalized] = $wilaya?->id;
        return $this->wilayaCache[$normalized];
    }

    /**
     * Tries to find a Commune ID based on name and wilaya ID.
     */
    public function resolveCommune(?string $communeName, ?int $wilayaId): ?int
    {
        if (empty($communeName)) {
            return null;
        }

        $normalized = Str::slug($communeName);
        $cacheKey = $wilayaId ? "{$wilayaId}_{$normalized}" : "global_{$normalized}";

        if (array_key_exists($cacheKey, $this->communeCache)) {
            return $this->communeCache[$cacheKey];
        }

        $query = Commune::where(function ($q) use ($communeName) {
            $q->where('name_fr', 'like', "%{$communeName}%")
              ->orWhere('name_ar', 'like', "%{$communeName}%");
        });

        if ($wilayaId) {
            $query->where('wilaya_id', $wilayaId);
        }

        $commune = $query->first();

        $this->communeCache[$cacheKey] = $commune?->id;
        return $this->communeCache[$cacheKey];
    }

    /**
     * Tries to find a Product ID by name or SKU. 
     * If not found, it optionally creates it. For MVP, we will just return the ID if found.
     */
    public function resolveProduct(?string $productIdentifier): ?int
    {
        if (empty($productIdentifier)) {
            return null;
        }

        $key = strtolower(trim($productIdentifier));

        if (array_key_exists($key, $this->productCache)) {
            return $this->productCache[$key];
        }

        $product = Product::where('sku', $key)
            ->orWhere('name', 'like', "%{$productIdentifier}%")
            ->first();

        if (!$product) {
            $product = Product::create([
                'name' => trim($productIdentifier),
                'sku' => Str::slug($productIdentifier) . '-' . rand(1000, 9999),
                'purchase_cost' => 0,
                'selling_price' => 0,
                'is_active' => true,
            ]);
        }

        $this->productCache[$key] = $product?->id;
        return $this->productCache[$key];
    }

    /**
     * Tries to find an Employee ID by name. 
     * If not found, creates a new employee with 'confirmation' role.
     */
    public function resolveEmployee(?string $employeeName): ?int
    {
        if (empty($employeeName)) {
            return null;
        }

        $key = strtolower(trim($employeeName));

        static $employeeCache = [];

        if (array_key_exists($key, $employeeCache)) {
            return $employeeCache[$key];
        }

        $employee = \App\Models\Employee::where('name', 'like', "%{$employeeName}%")->first();

        if (!$employee) {
            // Create a new confirmatrice
            $employee = \App\Models\Employee::create([
                'name' => trim($employeeName),
                'role' => 'confirmation',
                'is_active' => true,
            ]);
        }

        $employeeCache[$key] = $employee->id;
        return $employeeCache[$key];
    }
}
