<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreProductRequest;
use App\Http\Requests\UpdateProductRequest;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use App\Services\ProductService;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function __construct(private ProductService $productService)
    {
    }

    public function index(Request $request)
    {
        $products = $this->productService->getList($request->all(), $request->input('per_page', 15));
        return ProductResource::collection($products);
    }

    public function store(StoreProductRequest $request)
    {
        $product = $this->productService->create($request->validated());
        return new ProductResource($product);
    }

    public function show(Product $product)
    {
        return new ProductResource($product->load('category'));
    }

    public function update(UpdateProductRequest $request, Product $product)
    {
        $product = $this->productService->update($product, $request->validated());
        return new ProductResource($product);
    }

    public function destroy(Product $product)
    {
        $this->productService->delete($product);
        return response()->noContent();
    }
}
