<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreCategoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255', 'alpha_dash', Rule::unique('categories', 'slug')],
            'description' => ['nullable', 'string'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Please provide a category name.',
            'name.max' => 'The category name may not be greater than 255 characters.',
            'slug.required' => 'Please provide a URL-friendly category slug.',
            'slug.alpha_dash' => 'The category slug may only contain letters, numbers, dashes, and underscores.',
            'slug.unique' => 'A category with this slug already exists.',
        ];
    }
}
