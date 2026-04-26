<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreReviewRequest;
use App\Http\Requests\UpdateReviewRequest;
use App\Http\Resources\ReviewResource;
use App\Models\Review;
use App\Services\ReviewService;
use App\Support\CacheKeys;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;

class ReviewController extends Controller
{
    public function __construct(private readonly ReviewService $reviews)
    {
    }

    public function index(): JsonResponse
    {
        $payload = $this->reviews->list((int) request('page', 1));

        return response()
            ->json($payload)
            ->header('Cache-Control', 'private, max-age='.CacheKeys::REVIEW_TTL);
    }

    public function store(StoreReviewRequest $request): JsonResponse
    {
        $review = $this->reviews->create([
            ...$request->validated(),
            'is_approved' => false,
        ]);

        return ReviewResource::make($review->load('product'))
            ->response()
            ->setStatusCode(Response::HTTP_CREATED);
    }

    public function show(Review $review): JsonResponse
    {
        $payload = $this->reviews->detail($review);

        return response()
            ->json($payload)
            ->header('Cache-Control', 'private, max-age='.CacheKeys::REVIEW_TTL);
    }

    public function update(UpdateReviewRequest $request, Review $review): ReviewResource
    {
        $review = $this->reviews->update($review, $request->validated());

        return ReviewResource::make($review->load('product'));
    }

    public function destroy(Review $review): Response
    {
        $this->reviews->delete($review);

        return response()->noContent();
    }
}
