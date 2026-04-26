<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        collect([
            [
                'name' => 'Wellness Essentials',
                'slug' => 'wellness-essentials',
                'description' => 'Everyday health and personal care products.',
            ],
            [
                'name' => 'Home Diagnostics',
                'slug' => 'home-diagnostics',
                'description' => 'Simple diagnostic tools for private at-home use.',
            ],
            [
                'name' => 'Nutrition Support',
                'slug' => 'nutrition-support',
                'description' => 'Supplements and nutrition products for daily support.',
            ],
        ])->each(function (array $category) {
            Category::updateOrCreate(
                ['slug' => $category['slug']],
                $category,
            );
        });
    }
}
