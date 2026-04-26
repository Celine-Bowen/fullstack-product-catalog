<?php

namespace Database\Seeders;

use App\Models\Product;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

class ReviewSeeder extends Seeder
{
    public function run(): void
    {
        $reviewCreatedAt = Carbon::now()->subDays(10);

        collect([
            [
                'product' => 'cycle-comfort-kit',
                'reviewer_name' => 'Amara N.',
                'email' => 'amara@example.com',
                'rating' => 5,
                'body' => 'The kit is thoughtful and easy to keep in a work bag.',
                'is_approved' => true,
            ],
            [
                'product' => 'cycle-comfort-kit',
                'reviewer_name' => 'Lina P.',
                'email' => 'lina@example.com',
                'rating' => 4,
                'body' => 'Helpful selection, especially the heat patches.',
                'is_approved' => true,
            ],
            [
                'product' => 'daily-hydration-tablets',
                'reviewer_name' => 'Grace M.',
                'email' => 'grace@example.com',
                'rating' => 4,
                'body' => 'Dissolves quickly and the taste is mild.',
                'is_approved' => true,
            ],
            [
                'product' => 'home-pregnancy-test-pack',
                'reviewer_name' => 'Nadia K.',
                'email' => 'nadia@example.com',
                'rating' => 5,
                'body' => 'Clear instructions and discreet packaging.',
                'is_approved' => true,
            ],
            [
                'product' => 'home-pregnancy-test-pack',
                'reviewer_name' => 'Priya S.',
                'email' => 'priya@example.com',
                'rating' => 3,
                'body' => 'Worked fine, but I would like more guidance in the box.',
                'is_approved' => false,
            ],
            [
                'product' => 'ovulation-tracking-kit',
                'reviewer_name' => 'Maya R.',
                'email' => 'maya@example.com',
                'rating' => 5,
                'body' => 'The daily layout made tracking straightforward.',
                'is_approved' => true,
            ],
            [
                'product' => 'iron-level-screening-kit',
                'reviewer_name' => 'Eva T.',
                'email' => 'eva@example.com',
                'rating' => 4,
                'body' => 'Sample collection was easier than expected.',
                'is_approved' => false,
            ],
            [
                'product' => 'prenatal-vitamin-blend',
                'reviewer_name' => 'Sophia B.',
                'email' => 'sophia@example.com',
                'rating' => 5,
                'body' => 'Gentle on my stomach and easy to take daily.',
                'is_approved' => true,
            ],
            [
                'product' => 'prenatal-vitamin-blend',
                'reviewer_name' => 'Irene C.',
                'email' => 'irene@example.com',
                'rating' => 2,
                'body' => 'The tablets were larger than I prefer.',
                'is_approved' => false,
            ],
            [
                'product' => 'plant-protein-sachets',
                'reviewer_name' => 'Tessa W.',
                'email' => 'tessa@example.com',
                'rating' => 4,
                'body' => 'Convenient for travel and mixes well with oats.',
                'is_approved' => true,
            ],
        ])->each(function (array $review, int $index) use ($reviewCreatedAt) {
            $product = Product::where('slug', $review['product'])->firstOrFail();
            unset($review['product']);

            $product->reviews()->updateOrCreate(
                [
                    'product_id' => $product->id,
                    'email' => $review['email'],
                ],
                [
                    ...$review,
                    'created_at' => $reviewCreatedAt->copy()->addDays($index),
                    'updated_at' => $reviewCreatedAt->copy()->addDays($index),
                ],
            );
        });
    }
}
