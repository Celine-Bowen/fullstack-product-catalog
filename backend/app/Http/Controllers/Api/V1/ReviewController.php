<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreReviewRequest;
use App\Http\Requests\UpdateReviewRequest;
use App\Http\Resources\ReviewResource;
use App\Models\Review;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;

class ReviewController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        $reviews = Review::query()
            ->with('product')
            ->latest()
            ->paginate();

        return ReviewResource::collection($reviews);
    }

    public function store(StoreReviewRequest $request): JsonResponse
    {
        $review = Review::create([
            ...$request->validated(),
            'is_approved' => false,
        ]);

        return ReviewResource::make($review->load('product'))
            ->response()
            ->setStatusCode(Response::HTTP_CREATED);
    }

    public function show(Review $review): ReviewResource
    {
        return ReviewResource::make($review->load('product'));
    }

    public function update(UpdateReviewRequest $request, Review $review): ReviewResource
    {
        $review->update($request->validated());

        return ReviewResource::make($review->load('product'));
    }

    public function destroy(Review $review): Response
    {
        $review->delete();

        return response()->noContent();
    }
}
