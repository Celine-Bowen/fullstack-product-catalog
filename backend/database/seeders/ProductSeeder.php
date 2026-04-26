<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        collect([
            [
                'category' => 'wellness-essentials',
                'name' => 'Cycle Comfort Kit',
                'slug' => 'cycle-comfort-kit',
                'description' => 'A compact care kit with heat patches and gentle herbal tea.',
                'price' => 24.99,
                'stock_qty' => 45,
                'is_published' => true,
            ],
            [
                'category' => 'wellness-essentials',
                'name' => 'Daily Hydration Tablets',
                'slug' => 'daily-hydration-tablets',
                'description' => 'Low-sugar electrolyte tablets for daily hydration.',
                'price' => 12.50,
                'stock_qty' => 120,
                'is_published' => true,
            ],
            [
                'category' => 'wellness-essentials',
                'name' => 'Sensitive Skin Wash',
                'slug' => 'sensitive-skin-wash',
                'description' => 'Fragrance-free wash formulated for sensitive skin.',
                'price' => 18.00,
                'stock_qty' => 0,
                'is_published' => false,
            ],
            [
                'category' => 'home-diagnostics',
                'name' => 'Home Pregnancy Test Pack',
                'slug' => 'home-pregnancy-test-pack',
                'description' => 'Two-pack pregnancy tests with clear instructions.',
                'price' => 9.99,
                'stock_qty' => 80,
                'is_published' => true,
            ],
            [
                'category' => 'home-diagnostics',
                'name' => 'Ovulation Tracking Kit',
                'slug' => 'ovulation-tracking-kit',
                'description' => 'Seven-day ovulation test kit for cycle tracking.',
                'price' => 21.75,
                'stock_qty' => 36,
                'is_published' => true,
            ],
            [
                'category' => 'home-diagnostics',
                'name' => 'Iron Level Screening Kit',
                'slug' => 'iron-level-screening-kit',
                'description' => 'At-home sample collection kit for iron level screening.',
                'price' => 39.00,
                'stock_qty' => 14,
                'is_published' => false,
            ],
            [
                'category' => 'nutrition-support',
                'name' => 'Prenatal Vitamin Blend',
                'slug' => 'prenatal-vitamin-blend',
                'description' => 'Daily prenatal vitamin blend with folate and iron.',
                'price' => 32.00,
                'stock_qty' => 64,
                'is_published' => true,
            ],
            [
                'category' => 'nutrition-support',
                'name' => 'Plant Protein Sachets',
                'slug' => 'plant-protein-sachets',
                'description' => 'Single-serve plant protein sachets for busy mornings.',
                'price' => 27.50,
                'stock_qty' => 52,
                'is_published' => true,
            ],
        ])->each(function (array $product) {
            $category = Category::where('slug', $product['category'])->firstOrFail();
            unset($product['category']);

            Product::updateOrCreate(
                ['slug' => $product['slug']],
                [
                    ...$product,
                    'category_id' => $category->id,
                ],
            );
        });
    }
}
