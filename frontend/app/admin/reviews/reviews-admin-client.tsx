"use client";

import { useMemo, useState } from "react";
import { getBrowserApiBase, type Paginated, type Review, type ReviewModerationValues } from "@/lib/api";

type Toast = {
  message: string;
  type: "success" | "error";
};

export function ReviewsAdminClient() {
  const apiBase = useMemo(() => getBrowserApiBase(), []);
  const [token, setToken] = useState(() => (typeof window === "undefined" ? "" : window.localStorage.getItem("catalog_admin_token") ?? ""));
  const [reviews, setReviews] = useState<Review[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  function pushToast(message: string, type: Toast["type"] = "success") {
    setToasts((items) => [...items.slice(-2), { message, type }]);
  }

  async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${apiBase}${path}`, {
      ...options,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });

    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as { message?: string; errors?: Record<string, string[]> } | null;
      const firstFieldError = body?.errors ? Object.values(body.errors).flat()[0] : undefined;
      throw new Error(firstFieldError ?? body?.message ?? `Request failed with status ${response.status}`);
    }

    if (response.status === 204) {
      return null as T;
    }

    return response.json() as Promise<T>;
  }

  async function loadReviews() {
    setIsLoading(true);

    try {
      const response = await request<Paginated<Review>>("/reviews");
      setReviews(response.data);
      pushToast("Reviews loaded.");
    } catch (error) {
      pushToast(error instanceof Error ? error.message : "Unable to load reviews.", "error");
    } finally {
      setIsLoading(false);
    }
  }

  function updateToken(value: string) {
    setToken(value);
    window.localStorage.setItem("catalog_admin_token", value);
  }

  async function setApproval(review: Review, isApproved: boolean) {
    setReviews((items) => items.map((item) => (item.id === review.id ? { ...item, is_approved: isApproved } : item)));

    try {
      const payload: ReviewModerationValues = { isApproved };

      await request(`/reviews/${review.id}`, {
        method: "PATCH",
        body: JSON.stringify({ is_approved: payload.isApproved }),
      });
      pushToast(isApproved ? "Review approved." : "Review rejected.");
    } catch (error) {
      setReviews((items) => items.map((item) => (item.id === review.id ? review : item)));
      pushToast(error instanceof Error ? error.message : "Unable to update review.", "error");
    }
  }

  async function deleteReview(review: Review) {
    if (!window.confirm("Delete this review?")) {
      return;
    }

    const previousReviews = reviews;
    setReviews((items) => items.filter((item) => item.id !== review.id));

    try {
      await request(`/reviews/${review.id}`, { method: "DELETE" });
      pushToast("Review deleted.");
    } catch (error) {
      setReviews(previousReviews);
      pushToast(error instanceof Error ? error.message : "Unable to delete review.", "error");
    }
  }

  return (
    <div className="mt-6 space-y-6">
      <div className="fixed right-4 top-4 z-50 w-[min(24rem,calc(100vw-2rem))] space-y-2">
        {toasts.map((toast, index) => (
          <div key={`${toast.message}-${index}`} className={`flex items-start justify-between gap-3 rounded-md border px-4 py-3 text-sm shadow-sm ${toast.type === "success" ? "border-teal-200 bg-teal-50 text-teal-900" : "border-red-200 bg-red-50 text-red-900"}`}>
            <span>{toast.message}</span>
            <button className="font-semibold" type="button" onClick={() => setToasts((items) => items.filter((_, itemIndex) => itemIndex !== index))}>
              Close
            </button>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <label className="block max-w-xl flex-1">
          <span className="text-sm font-medium text-slate-700">Sanctum bearer token</span>
          <input
            value={token}
            onChange={(event) => updateToken(event.target.value)}
            className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            placeholder="Paste an admin token"
          />
        </label>

        <button className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 disabled:opacity-60" type="button" onClick={loadReviews} disabled={isLoading}>
          {isLoading ? "Loading..." : "Load reviews"}
        </button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="min-w-[56rem] divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-slate-600">
            <tr>
              <th className="sticky left-0 z-20 w-48 min-w-48 bg-slate-50 px-3 py-3 shadow-[1px_0_0_#e2e8f0] sm:px-4">Reviewer</th>
              <th className="px-3 py-3 sm:px-4">Product</th>
              <th className="px-3 py-3 sm:px-4">Rating</th>
              <th className="px-3 py-3 sm:px-4">Status</th>
              <th className="px-3 py-3 sm:px-4">Review</th>
              <th className="px-3 py-3 sm:px-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {reviews.map((review) => (
              <tr key={review.id}>
                <td className="sticky left-0 z-10 w-48 min-w-48 bg-white px-3 py-3 shadow-[1px_0_0_#e2e8f0] sm:px-4">
                  <p className="font-medium text-slate-950">{review.reviewer_name}</p>
                  <p className="text-xs text-slate-500">{review.email}</p>
                </td>
                <td className="px-3 py-3 sm:px-4">{review.product?.name ?? review.product_id}</td>
                <td className="px-3 py-3 sm:px-4">{review.rating} / 5</td>
                <td className="px-3 py-3 sm:px-4">
                  <span className={`rounded-full px-2 py-1 text-xs font-medium ${review.is_approved ? "bg-teal-50 text-teal-800" : "bg-amber-50 text-amber-800"}`}>
                    {review.is_approved ? "Approved" : "Pending"}
                  </span>
                </td>
                <td className="max-w-sm px-3 py-3 text-slate-600 sm:px-4">{review.body}</td>
                <td className="space-x-2 px-3 py-3 sm:px-4">
                  <button className="font-medium text-teal-700 disabled:text-slate-400" type="button" disabled={review.is_approved} onClick={() => setApproval(review, true)}>
                    Approve
                  </button>
                  <button className="font-medium text-amber-700 disabled:text-slate-400" type="button" disabled={!review.is_approved} onClick={() => setApproval(review, false)}>
                    Reject
                  </button>
                  <button className="font-medium text-red-700" type="button" onClick={() => deleteReview(review)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
