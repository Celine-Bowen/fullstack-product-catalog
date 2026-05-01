<?php

namespace App\Services;

use App\Http\Resources\ReviewResource;
use App\Models\Review;
use App\Services\Concerns\Cacheable;
use App\Support\CacheKeys;

class ReviewService
{
    use Cacheable;

    /**
     * @return array<string, mixed>
     */
    public function list(int $page): array
    {
        return $this->cache([CacheKeys::REVIEW_TAG, CacheKeys::PRODUCT_TAG])
            ->remember(CacheKeys::reviewList($page), CacheKeys::REVIEW_TTL, function () use ($page) {
                $reviews = Review::query()
                    ->with('product')
                    ->latest()
                    ->paginate(perPage: CacheKeys::PAGINATION_PER_PAGE, page: $page);

                return ReviewResource::collection($reviews)
                    ->response()
                    ->getData(true);
            });
    }

    /**
     * @return array<string, mixed>
     */
    public function detail(Review $review): array
    {
        return $this->cache([CacheKeys::REVIEW_TAG, CacheKeys::PRODUCT_TAG])
            ->remember(CacheKeys::reviewDetail($review->id), CacheKeys::REVIEW_TTL, function () use ($review) {
                $review->load('product');

                return ReviewResource::make($review)
                    ->response()
                    ->getData(true);
            });
    }

    /**
     * @param  array<string, mixed>  $attributes
     */
    public function create(array $attributes): Review
    {
        $review = Review::create($attributes);
        $this->flushReviewCache();

        return $review;
    }

    /**
     * @param  array<string, mixed>  $attributes
     */
    public function update(Review $review, array $attributes): Review
    {
        $review->update($attributes);
        $this->flushReviewCache();

        return $review;
    }

    public function delete(Review $review): void
    {
        $review->delete();
        $this->flushReviewCache();
    }

    private function flushReviewCache(): void
    {
        $this->cache([CacheKeys::REVIEW_TAG, CacheKeys::PRODUCT_TAG])->flush();
    }
}
