<?php

namespace App\Services;

use App\Http\Resources\ProductResource;
use App\Models\Product;
use App\Services\Concerns\Cacheable;
use App\Support\CacheKeys;

class ProductService
{
    use Cacheable;

    /**
     * @return array<string, mixed>
     */
    public function list(int $page, ?string $categorySlug, bool $includeUnpublished): array
    {
        return $this->cache([CacheKeys::PRODUCT_TAG, CacheKeys::CATEGORY_TAG, CacheKeys::REVIEW_TAG])
            ->remember(CacheKeys::productList($page, $categorySlug, $includeUnpublished), CacheKeys::PRODUCT_TTL, function () use ($page, $categorySlug, $includeUnpublished) {
                $products = Product::query()
                    ->with('category')
                    ->withCount('approvedReviews')
                    ->withAvg('approvedReviews', 'rating')
                    ->when(! $includeUnpublished, fn ($query) => $query->published())
                    ->when($categorySlug, function ($query) use ($categorySlug) {
                        $query->whereHas('category', fn ($categoryQuery) => $categoryQuery->where('slug', $categorySlug));
                    })
                    ->latest()
                    ->paginate(page: $page);

                return ProductResource::collection($products)
                    ->response()
                    ->getData(true);
            });
    }

    /**
     * @return array<string, mixed>
     */
    public function detail(Product $product): array
    {
        return $this->cache([CacheKeys::PRODUCT_TAG, CacheKeys::CATEGORY_TAG, CacheKeys::REVIEW_TAG])
            ->remember(CacheKeys::productDetail($product->slug), CacheKeys::PRODUCT_TTL, function () use ($product) {
                $product
                    ->load(['category', 'approvedReviews' => fn ($query) => $query->latest()])
                    ->loadCount('approvedReviews')
                    ->loadAvg('approvedReviews', 'rating');

                return ProductResource::make($product)
                    ->response()
                    ->getData(true);
            });
    }

    /**
     * @param  array<string, mixed>  $attributes
     */
    public function create(array $attributes): Product
    {
        $product = Product::create($attributes);
        $this->flushCatalogCache();

        return $product;
    }

    /**
     * @param  array<string, mixed>  $attributes
     */
    public function update(Product $product, array $attributes): Product
    {
        $product->update($attributes);
        $this->flushCatalogCache();

        return $product;
    }

    public function delete(Product $product): void
    {
        $product->delete();
        $this->flushCatalogCache();
    }

    private function flushCatalogCache(): void
    {
        $this->cache([CacheKeys::PRODUCT_TAG, CacheKeys::CATEGORY_TAG, CacheKeys::REVIEW_TAG])->flush();
    }
}
