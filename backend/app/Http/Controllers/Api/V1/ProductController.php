<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreProductRequest;
use App\Http\Requests\UpdateProductRequest;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use App\Services\ProductService;
use App\Support\CacheKeys;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class ProductController extends Controller
{
    public function __construct(private readonly ProductService $products)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $includeUnpublished = $request->boolean('include_unpublished') && auth('sanctum')->check();
        $payload = $this->products->list(
            (int) $request->query('page', 1),
            $request->filled('category') ? (string) $request->string('category') : null,
            $includeUnpublished,
        );

        return response()
            ->json($payload)
            ->header('Cache-Control', ($includeUnpublished ? 'private' : 'public').', max-age='.CacheKeys::PRODUCT_TTL);
    }

    public function store(StoreProductRequest $request): JsonResponse
    {
        $product = $this->products->create($request->validated());

        return ProductResource::make($product->load('category'))
            ->response()
            ->setStatusCode(Response::HTTP_CREATED);
    }

    public function show(Product $product): JsonResponse
    {
        $isProtectedView = ! $product->is_published && auth('sanctum')->check();

        abort_unless($product->is_published || $isProtectedView, Response::HTTP_NOT_FOUND);

        $payload = $this->products->detail($product);

        return response()
            ->json($payload)
            ->header('Cache-Control', ($isProtectedView ? 'private' : 'public').', max-age='.CacheKeys::PRODUCT_TTL);
    }

    public function update(UpdateProductRequest $request, Product $product): ProductResource
    {
        $product = $this->products->update($product, $request->validated());

        return ProductResource::make($product->load('category'));
    }

    public function destroy(Product $product): Response
    {
        $this->products->delete($product);

        return response()->noContent();
    }
}
