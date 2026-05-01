<?php

namespace App\Services;

use App\Http\Resources\CategoryResource;
use App\Models\Category;
use App\Services\Concerns\Cacheable;
use App\Support\CacheKeys;

class CategoryService
{
    use Cacheable;

    /**
     * @return array<string, mixed>
     */
    public function list(int $page): array
    {
        return $this->cache([CacheKeys::CATEGORY_TAG, CacheKeys::PRODUCT_TAG])
            ->remember(CacheKeys::categoryList($page), CacheKeys::CATEGORY_TTL, function () use ($page) {
                $categories = Category::query()
                    ->withCount('products')
                    ->latest()
                    ->paginate(perPage: CacheKeys::PAGINATION_PER_PAGE, page: $page);

                return CategoryResource::collection($categories)
                    ->response()
                    ->getData(true);
            });
    }

    /**
     * @return array<string, mixed>
     */
    public function detail(Category $category): array
    {
        return $this->cache([CacheKeys::CATEGORY_TAG, CacheKeys::PRODUCT_TAG])
            ->remember(CacheKeys::categoryDetail($category->slug), CacheKeys::CATEGORY_TTL, function () use ($category) {
                $category->load(['products' => fn ($query) => $query->published()->latest()]);

                return CategoryResource::make($category)
                    ->response()
                    ->getData(true);
            });
    }

    /**
     * @param  array<string, mixed>  $attributes
     */
    public function create(array $attributes): Category
    {
        $category = Category::create($attributes);
        $this->flushCatalogCache();

        return $category;
    }

    /**
     * @param  array<string, mixed>  $attributes
     */
    public function update(Category $category, array $attributes): Category
    {
        $category->update($attributes);
        $this->flushCatalogCache();

        return $category;
    }

    public function delete(Category $category): void
    {
        $category->delete();
        $this->flushCatalogCache();
    }

    private function flushCatalogCache(): void
    {
        $this->cache([CacheKeys::CATEGORY_TAG, CacheKeys::PRODUCT_TAG])->flush();
    }
}
