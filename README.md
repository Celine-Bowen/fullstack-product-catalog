# Fullstack Product Catalog

Women First Digital take-home assessment for a full-stack product catalog and review platform.

## Current Status

This repository is being built incrementally. The completed checkpoint is:

- Part 1.1: database schema, Eloquent models, relationships, and seed data.

Upcoming checkpoints:

- Part 1.2: versioned Laravel REST API endpoints.
- Part 1.3: service-layer caching and invalidation.
- Part 1.4: validation, error handling, Sanctum auth, and throttling.
- Part 2: Next.js frontend with SSG, ISR, admin CRUD, and responsive UI.

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

The model and seeder files currently pass PHP syntax checks.

Example checks:

```bash
php -l backend/app/Models/Category.php
php -l backend/app/Models/Product.php
php -l backend/app/Models/Review.php
php -l backend/database/seeders/DatabaseSeeder.php
```

Full database seeding should be run in an environment with the required PDO driver installed, or through the Docker backend container.

## Implementation Notes

- Models define explicit mass assignment fields with `$fillable`.
- Boolean and numeric fields are cast at the model layer.
- Slug route keys are defined for categories and products in preparation for REST detail endpoints.
- Query scopes exist for published products and approved reviews.
- Seed data is hand-written rather than randomized to keep review and testing predictable.
