# Fullstack Product Catalog

Full-stack product catalog and review platform.

## Current Status

This repository is being built incrementally. The completed checkpoint is:

- Part 1.1: database schema, Eloquent models, relationships, and seed data.
- Part 1.2: versioned Laravel REST API endpoints for categories, products, and reviews.
- Part 1.3: Redis-backed service-layer caching with mutation invalidation.
- Part 1.4: Form Request validation, consistent API error envelopes, and public review throttling.
- Part 2.1: Next.js App Router pages for public catalog routes and client-side admin screens.

Upcoming checkpoints:

- Part 2.2: SSG/ISR hardening and route-level polish.
- Part 2.3: admin form validation, optimistic UI polish, and toast notifications.
- Part 2.4: Drizzle schema type contract.
- Part 2.5: responsive QA pass.

## Architecture

The project is organized as a monorepo:

```text
fullstack-product-catalog/
  backend/     Laravel REST API
  frontend/    Next.js frontend
```

Current backend stack:

- PHP / Laravel
- PostgreSQL
- Redis
- Laravel Eloquent ORM
- Docker Compose for local services

## Data Model

The catalog currently has three domain resources.

### Categories

Fields:

- `id`
- `name`
- `slug`
- `description`
- `created_at`
- `updated_at`
- `deleted_at`

Notes:

- `slug` is unique and indexed.
- Categories use soft deletes.
- A category has many products.

### Products

Fields:

- `id`
- `category_id`
- `name`
- `slug`
- `description`
- `price`
- `stock_qty`
- `is_published`
- `created_at`
- `updated_at`
- `deleted_at`

Notes:

- `category_id` references categories.
- `slug` is unique and indexed.
- `is_published` is indexed.
- Products use soft deletes.
- A product belongs to a category.
- A product has many reviews.

### Reviews

Fields:

- `id`
- `product_id`
- `reviewer_name`
- `email`
- `rating`
- `body`
- `is_approved`
- `created_at`
- `updated_at`

Notes:

- `product_id` references products.
- `email` is indexed.
- `is_approved` is indexed.
- A review belongs to a product.

## Seed Data

The seed data is deterministic so reviewers get the same catalog every time.

Seeders are split by resource:

- `CategorySeeder`: creates 3 categories.
- `ProductSeeder`: creates 8 products with mixed published and unpublished states.
- `ReviewSeeder`: creates 10 reviews with mixed approved and unapproved states.

`DatabaseSeeder` creates a local admin user and then runs the catalog seeders in dependency order.

Default local admin:

```text
Email: admin@example.com
Password: password
```

The seeders use `updateOrCreate`, so they can be safely rerun during local development.

## Backend Setup

From the backend directory:

```bash
cd backend
composer install
php artisan key:generate
php artisan migrate
php artisan db:seed
```

With Docker Compose from the repository root:

```bash
docker compose up -d
docker compose exec backend php artisan migrate --seed
```

## Verification

The model, seeder, service, controller, and test files currently pass PHP syntax checks.

Example checks:

```bash
php -l backend/app/Models/Category.php
php -l backend/app/Models/Product.php
php -l backend/app/Models/Review.php
php -l backend/database/seeders/DatabaseSeeder.php
php -l backend/tests/Feature/Api/CatalogApiTest.php
```

Full database seeding should be run in an environment with the required PDO driver installed, or through the Docker backend container.

Run the API feature tests from the backend container:

```bash
docker compose up -d --build
docker compose exec backend php artisan test --filter=CatalogApiTest
```

The feature tests cover:

- public product listing with response cache headers;
- public review validation envelope;
- public review submission;
- unauthenticated protected writes;
- authenticated product creation with Sanctum.

## API Endpoints

All API routes are versioned under `/api/v1`.

Public routes:

```text
GET    /api/v1/health
GET    /api/v1/categories
GET    /api/v1/categories/{category}
GET    /api/v1/products
GET    /api/v1/products/{product}
POST   /api/v1/reviews
```

Protected routes require a Laravel Sanctum bearer token:

```text
POST   /api/v1/categories
PUT    /api/v1/categories/{category}
PATCH  /api/v1/categories/{category}
DELETE /api/v1/categories/{category}

POST   /api/v1/products
PUT    /api/v1/products/{product}
PATCH  /api/v1/products/{product}
DELETE /api/v1/products/{product}

GET    /api/v1/reviews
GET    /api/v1/reviews/{review}
PUT    /api/v1/reviews/{review}
PATCH  /api/v1/reviews/{review}
DELETE /api/v1/reviews/{review}
```

Public review submission is throttled to 5 requests per minute per IP.

## Frontend Routes

The Next.js frontend uses the App Router.

Public routes:

```text
/                    SSG homepage with featured products
/products            SSG + ISR listing with category filter
/products/[slug]     SSG + ISR product detail with approved reviews
/categories          SSG category card grid
/categories/[slug]   SSG + ISR category detail with products
```

Admin routes:

```text
/admin/products      Client-side product CRUD screen
/admin/reviews       Client-side review moderation screen
```

Frontend env:

```text
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
API_URL=http://backend:8000/api/v1
```

`NEXT_PUBLIC_API_URL` is used by browser-side admin fetches. `API_URL` is used by server-side Next.js rendering inside Docker, where the Laravel service is reachable as `backend`.

## Error Handling

API errors use a consistent JSON envelope:

```json
{
  "message": "The given data was invalid.",
  "errors": {
    "field": ["Descriptive validation message."]
  }
}
```

Handled API statuses:

- `401`: unauthenticated requests to protected Sanctum routes.
- `404`: missing routes or missing route-bound models.
- `422`: validation failures from Laravel Form Requests.
- `429`: public review submission throttle limit.
- `500`: unexpected server errors.

Write operations use Laravel Form Requests with resource-specific validation rules and descriptive messages.

## Caching Strategy

The API uses Redis through Laravel's cache store:

```text
CACHE_STORE=redis
REDIS_CLIENT=phpredis
REDIS_HOST=redis
REDIS_PORT=6379
```

GET response payloads are cached at the service layer, not inside controllers:

- `CategoryService`
- `ProductService`
- `ReviewService`

Cache key convention:

```text
categories.list.page.{page}
categories.detail.{slug}
products.list.page.{page}.category.{slug|all}.visibility.{published|all}
products.detail.{slug}
reviews.list.page.{page}
reviews.detail.{id}
```

TTL decisions:

- Categories: 300 seconds, because category data changes less frequently.
- Products: 60 seconds, because product availability, publish state, and ratings can change more often.
- Reviews: 60 seconds, because moderation actions should appear quickly.

Invalidation:

- Category create, update, and delete flush category and product cache tags.
- Product create, update, and delete flush product, category, and review cache tags.
- Review create, update, and delete flush review and product cache tags.

GET responses include `Cache-Control` headers:

- Public catalog responses use `public, max-age={ttl}`.
- Protected admin responses use `private, max-age={ttl}`.
- Health checks use `no-store`.

## Implementation Notes

- Models define explicit mass assignment fields with `$fillable`.
- Boolean and numeric fields are cast at the model layer.
- Slug route keys are defined for categories and products in preparation for REST detail endpoints.
- Query scopes exist for published products and approved reviews.
- Seed data is hand-written rather than randomized to keep review and testing predictable.
- API responses use Laravel JSON API Resources.
- Write endpoints are protected with Sanctum token authentication.
- API reads are cached as resource-shaped arrays through Redis-backed service classes with tag-based invalidation.
