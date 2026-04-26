<?php

namespace Tests\Feature\Api;

use App\Models\Category;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class CatalogApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_products_index_returns_only_published_products_with_cache_headers(): void
    {
        $category = Category::create([
            'name' => 'Wellness Essentials',
            'slug' => 'wellness-essentials',
            'description' => 'Everyday wellness products.',
        ]);

        Product::create([
            'category_id' => $category->id,
            'name' => 'Published Product',
            'slug' => 'published-product',
            'description' => 'Visible in public catalog.',
            'price' => 19.99,
            'stock_qty' => 12,
            'is_published' => true,
        ]);

        Product::create([
            'category_id' => $category->id,
            'name' => 'Draft Product',
            'slug' => 'draft-product',
            'description' => 'Hidden from public catalog.',
            'price' => 29.99,
            'stock_qty' => 4,
            'is_published' => false,
        ]);

        $response = $this->getJson('/api/v1/products');

        $response
            ->assertOk()
            ->assertJsonPath('data.0.slug', 'published-product')
            ->assertJsonMissing(['slug' => 'draft-product']);

        $cacheControl = $response->headers->get('Cache-Control');

        $this->assertStringContainsString('public', $cacheControl);
        $this->assertStringContainsString('max-age=60', $cacheControl);
    }

    public function test_public_review_submission_uses_validation_error_envelope(): void
    {
        $response = $this->postJson('/api/v1/reviews', []);

        $response
            ->assertUnprocessable()
            ->assertJsonStructure([
                'message',
                'errors' => [
                    'product_id',
                    'reviewer_name',
                    'email',
                    'rating',
                    'body',
                ],
            ])
            ->assertJsonPath('message', 'The given data was invalid.');
    }

    public function test_public_review_submission_creates_unapproved_review(): void
    {
        $category = Category::create([
            'name' => 'Home Diagnostics',
            'slug' => 'home-diagnostics',
            'description' => 'At-home diagnostic products.',
        ]);

        $product = Product::create([
            'category_id' => $category->id,
            'name' => 'Home Pregnancy Test Pack',
            'slug' => 'home-pregnancy-test-pack',
            'description' => 'Two-pack pregnancy tests with clear instructions.',
            'price' => 9.99,
            'stock_qty' => 80,
            'is_published' => true,
        ]);

        $response = $this->postJson('/api/v1/reviews', [
            'product_id' => $product->id,
            'reviewer_name' => 'Test Reviewer',
            'email' => 'reviewer@example.com',
            'rating' => 5,
            'body' => 'This product was helpful and easy to use.',
        ]);

        $response
            ->assertCreated()
            ->assertJsonPath('data.product_id', $product->id)
            ->assertJsonPath('data.is_approved', false);

        $this->assertDatabaseHas('reviews', [
            'product_id' => $product->id,
            'email' => 'reviewer@example.com',
            'is_approved' => false,
        ]);
    }

    public function test_product_write_routes_require_sanctum_authentication(): void
    {
        $response = $this->postJson('/api/v1/products', []);

        $response
            ->assertUnauthorized()
            ->assertJson([
                'message' => 'Unauthenticated.',
                'errors' => [],
            ]);
    }

    public function test_admin_can_login_and_receive_sanctum_token(): void
    {
        User::factory()->create([
            'name' => 'Catalog Admin',
            'email' => 'admin@example.com',
            'password' => Hash::make('password'),
        ]);

        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'admin@example.com',
            'password' => 'password',
        ]);

        $response
            ->assertOk()
            ->assertJsonPath('data.user.email', 'admin@example.com')
            ->assertJsonStructure([
                'data' => [
                    'token',
                    'user' => [
                        'id',
                        'name',
                        'email',
                    ],
                ],
            ]);
    }

    public function test_authenticated_user_can_create_product(): void
    {
        Sanctum::actingAs(User::factory()->create());

        $category = Category::create([
            'name' => 'Nutrition Support',
            'slug' => 'nutrition-support',
            'description' => 'Daily nutrition products.',
        ]);

        $response = $this->postJson('/api/v1/products', [
            'category_id' => $category->id,
            'name' => 'Prenatal Vitamin Blend',
            'slug' => 'prenatal-vitamin-blend',
            'description' => 'Daily prenatal vitamin blend with folate and iron.',
            'price' => 32.00,
            'stock_qty' => 64,
            'is_published' => true,
        ]);

        $response
            ->assertCreated()
            ->assertJsonPath('data.slug', 'prenatal-vitamin-blend');

        $this->assertDatabaseHas('products', [
            'slug' => 'prenatal-vitamin-blend',
            'is_published' => true,
        ]);
    }
}
