<?php

namespace App\Services;

use App\Models\Product;
use Illuminate\Pagination\LengthAwarePaginator;

class ProductService
{
    /**
     * Get paginated and filtered list of products.
     */
    public function getList(array $filters, int $perPage = 15): LengthAwarePaginator
    {
        $query = Product::with('category')->latest();

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('sku', 'like', "%{$search}%");
            });
        }

        if (isset($filters['is_active'])) {
            $query->where('is_active', filter_var($filters['is_active'], FILTER_VALIDATE_BOOLEAN));
        }

        return $query->paginate($perPage);
    }

    public function create(array $data): Product
    {
        return Product::create($data);
    }

    public function update(Product $product, array $data): Product
    {
        $product->update($data);
        return $product;
    }

    public function delete(Product $product): void
    {
        $product->delete();
    }
}
