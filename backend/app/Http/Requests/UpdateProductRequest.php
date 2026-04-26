<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateProductRequest extends FormRequest
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
            'category_id' => ['sometimes', 'required', 'integer', Rule::exists('categories', 'id')],
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'slug' => [
                'sometimes',
                'required',
                'string',
                'max:255',
                'alpha_dash',
                Rule::unique('products', 'slug')->ignore($this->route('product')),
            ],
            'description' => ['sometimes', 'nullable', 'string'],
            'price' => ['sometimes', 'required', 'numeric', 'min:0', 'max:99999999.99'],
            'stock_qty' => ['sometimes', 'required', 'integer', 'min:0'],
            'is_published' => ['sometimes', 'boolean'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'category_id.required' => 'Please choose a category when updating this field.',
            'category_id.exists' => 'The selected category does not exist.',
            'name.required' => 'Please provide a product name when updating this field.',
            'name.max' => 'The product name may not be greater than 255 characters.',
            'slug.required' => 'Please provide a URL-friendly product slug when updating this field.',
            'slug.alpha_dash' => 'The product slug may only contain letters, numbers, dashes, and underscores.',
            'slug.unique' => 'A product with this slug already exists.',
            'price.required' => 'Please provide a product price when updating this field.',
            'price.numeric' => 'The product price must be a valid number.',
            'price.min' => 'The product price cannot be negative.',
            'price.max' => 'The product price is too large.',
            'stock_qty.required' => 'Please provide the available stock quantity when updating this field.',
            'stock_qty.integer' => 'The stock quantity must be a whole number.',
            'stock_qty.min' => 'The stock quantity cannot be negative.',
            'is_published.boolean' => 'The published value must be true or false.',
        ];
    }
}
