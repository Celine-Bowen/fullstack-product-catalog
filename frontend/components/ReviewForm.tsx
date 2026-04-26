"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { getBrowserApiBase, type ApiError, type Product, type Resource, type Review, type ReviewFormValues } from "@/lib/api";

export function ReviewForm({ productId }: { productId: Product["id"] }) {
  const apiBase = useMemo(() => getBrowserApiBase(), []);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | undefined>();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ReviewFormValues>({
    defaultValues: {
      reviewer_name: "",
      email: "",
      rating: "5",
      body: "",
    },
  });

  async function submitReview(values: ReviewFormValues) {
    setStatus(undefined);

    try {
      const response = await fetch(`${apiBase}/reviews`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          product_id: productId,
          reviewer_name: values.reviewer_name,
          email: values.email,
          rating: Number(values.rating),
          body: values.body,
        }),
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as ApiError | null;
        const firstFieldError = body?.errors ? Object.values(body.errors).flat()[0] : undefined;

        throw new Error(firstFieldError ?? body?.message ?? `Review submission failed with status ${response.status}`);
      }

      await response.json() as Resource<Review>;
      reset();
      setStatus({
        type: "success",
        message: "Thanks for the review. It will appear after admin approval.",
      });
    } catch (error) {
      setStatus({
        type: "error",
        message: error instanceof Error ? error.message : "Unable to submit review.",
      });
    }
  }

  return (
    <form onSubmit={handleSubmit(submitReview)} className="mt-5 grid gap-4 rounded-lg border border-slate-200 bg-white p-5 md:grid-cols-2 dark:border-slate-800 dark:bg-slate-900">
      <label className="space-y-1">
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Name</span>
        <input
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
          {...register("reviewer_name", {
            required: "Please provide your name.",
            maxLength: { value: 255, message: "The reviewer name may not be greater than 255 characters." },
          })}
        />
        {errors.reviewer_name ? <span className="text-xs text-red-700 dark:text-red-300">{errors.reviewer_name.message}</span> : null}
      </label>

      <label className="space-y-1">
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Email</span>
        <input
          type="email"
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
          {...register("email", {
            required: "Please provide your email address.",
            maxLength: { value: 255, message: "The email may not be greater than 255 characters." },
            pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Please provide a valid email address." },
          })}
        />
        {errors.email ? <span className="text-xs text-red-700 dark:text-red-300">{errors.email.message}</span> : null}
      </label>

      <label className="space-y-1">
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Rating</span>
        <select className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100" {...register("rating", { required: "Please choose a rating." })}>
          <option className="bg-white text-slate-950 dark:bg-slate-950 dark:text-slate-100" value="5">5 / 5</option>
          <option className="bg-white text-slate-950 dark:bg-slate-950 dark:text-slate-100" value="4">4 / 5</option>
          <option className="bg-white text-slate-950 dark:bg-slate-950 dark:text-slate-100" value="3">3 / 5</option>
          <option className="bg-white text-slate-950 dark:bg-slate-950 dark:text-slate-100" value="2">2 / 5</option>
          <option className="bg-white text-slate-950 dark:bg-slate-950 dark:text-slate-100" value="1">1 / 5</option>
        </select>
      </label>

      <label className="space-y-1 md:col-span-2">
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Review</span>
        <textarea
          className="min-h-28 w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
          {...register("body", {
            required: "Please provide the review body.",
            minLength: { value: 10, message: "The review body must be at least 10 characters." },
          })}
        />
        {errors.body ? <span className="text-xs text-red-700 dark:text-red-300">{errors.body.message}</span> : null}
      </label>

      <div className="flex flex-col gap-3 md:col-span-2 md:flex-row md:items-center">
        <button className="rounded-md bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-60" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Submit review"}
        </button>
        {status ? (
          <p className={`text-sm ${status.type === "success" ? "text-teal-700 dark:text-teal-300" : "text-red-700 dark:text-red-300"}`}>
            {status.message}
          </p>
        ) : null}
      </div>
    </form>
  );
}
