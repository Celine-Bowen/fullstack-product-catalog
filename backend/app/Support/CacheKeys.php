<?php

namespace App\Support;

class CacheKeys
{
    public const PAGINATION_PER_PAGE = 5;
    public const CATEGORY_TTL = 300;
    public const PRODUCT_TTL = 60;
    public const REVIEW_TTL = 60;

    public const CATEGORY_TAG = 'categories';
    public const PRODUCT_TAG = 'products';
    public const REVIEW_TAG = 'reviews';

    public static function categoryList(int $page): string
    {
        return "categories.list.page.{$page}";
    }

    public static function categoryDetail(string $slug): string
    {
        return "categories.detail.{$slug}";
    }

    public static function productList(int $page, ?string $categorySlug, bool $includeUnpublished): string
    {
        $category = $categorySlug ?: 'all';
        $visibility = $includeUnpublished ? 'all' : 'published';

        return "products.list.page.{$page}.category.{$category}.visibility.{$visibility}";
    }

    public static function productDetail(string $slug): string
    {
        return "products.detail.{$slug}";
    }

    public static function reviewList(int $page): string
    {
        return "reviews.list.page.{$page}";
    }

    public static function reviewDetail(int $id): string
    {
        return "reviews.detail.{$id}";
    }
}
