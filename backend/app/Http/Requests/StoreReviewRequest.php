<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreReviewRequest extends FormRequest
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
            'product_id' => ['required', 'integer', Rule::exists('products', 'id')],
            'reviewer_name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'rating' => ['required', 'integer', 'min:1', 'max:5'],
            'body' => ['required', 'string', 'min:10'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'product_id.required' => 'Please choose the product being reviewed.',
            'product_id.exists' => 'The selected product does not exist.',
            'reviewer_name.required' => 'Please provide the reviewer name.',
            'reviewer_name.max' => 'The reviewer name may not be greater than 255 characters.',
            'email.required' => 'Please provide the reviewer email address.',
            'email.email' => 'Please provide a valid reviewer email address.',
            'rating.required' => 'Please provide a review rating.',
            'rating.integer' => 'The review rating must be a whole number.',
            'rating.min' => 'The review rating must be at least 1.',
            'rating.max' => 'The review rating may not be greater than 5.',
            'body.required' => 'Please provide the review body.',
            'body.min' => 'The review body must be at least 10 characters.',
        ];
    }
}
