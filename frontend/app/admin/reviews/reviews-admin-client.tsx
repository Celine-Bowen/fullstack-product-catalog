"use client";

import { useMemo, useState } from "react";
import { getBrowserApiBase, type Paginated, type Review } from "@/lib/api";

export function ReviewsAdminClient() {
  const apiBase = useMemo(() => getBrowserApiBase(), []);
  const [token, setToken] = useState(() => (typeof window === "undefined" ? "" : window.localStorage.getItem("catalog_admin_token") ?? ""));
  const [reviews, setReviews] = useState<Review[]>([]);
  const [message, setMessage] = useState("");

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
      const body = (await response.json().catch(() => null)) as { message?: string } | null;
      throw new Error(body?.message ?? `Request failed with status ${response.status}`);
    }

    if (response.status === 204) {
      return null as T;
    }

    return response.json() as Promise<T>;
  }

  async function loadReviews() {
    const response = await request<Paginated<Review>>("/reviews");
    setReviews(response.data);
  }

  function updateToken(value: string) {
    setToken(value);
    window.localStorage.setItem("catalog_admin_token", value);
  }

  async function setApproval(review: Review, isApproved: boolean) {
    setReviews((items) => items.map((item) => (item.id === review.id ? { ...item, is_approved: isApproved } : item)));

    try {
      await request(`/reviews/${review.id}`, {
        method: "PATCH",
        body: JSON.stringify({ is_approved: isApproved }),
      });
      setMessage(isApproved ? "Review approved." : "Review rejected.");
    } catch (error) {
      setReviews((items) => items.map((item) => (item.id === review.id ? review : item)));
      setMessage(error instanceof Error ? error.message : "Unable to update review.");
    }
  }

  async function deleteReview(review: Review) {
    if (!window.confirm("Delete this review?")) {
      return;
    }

    await request(`/reviews/${review.id}`, { method: "DELETE" });
    setReviews((items) => items.filter((item) => item.id !== review.id));
    setMessage("Review deleted.");
  }

  return (
    <div className="mt-6 space-y-6">
      <label className="block max-w-xl">
        <span className="text-sm font-medium text-slate-700">Sanctum bearer token</span>
        <input
          value={token}
          onChange={(event) => updateToken(event.target.value)}
          className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          placeholder="Paste an admin token"
        />
      </label>

      <button className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700" type="button" onClick={() => loadReviews().catch((error: Error) => setMessage(error.message))}>
        Load reviews
      </button>

      {message ? <p className="rounded-md bg-teal-50 px-3 py-2 text-sm text-teal-800">{message}</p> : null}

      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-slate-600">
            <tr>
              <th className="sticky left-0 bg-slate-50 px-4 py-3">Reviewer</th>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Rating</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {reviews.map((review) => (
              <tr key={review.id}>
                <td className="sticky left-0 bg-white px-4 py-3">
                  <p className="font-medium text-slate-950">{review.reviewer_name}</p>
                  <p className="text-xs text-slate-500">{review.email}</p>
                </td>
                <td className="px-4 py-3">{review.product?.name ?? review.product_id}</td>
                <td className="px-4 py-3">{review.rating} / 5</td>
                <td className="px-4 py-3">{review.is_approved ? "Approved" : "Pending"}</td>
                <td className="space-x-2 px-4 py-3">
                  <button className="text-teal-700" onClick={() => setApproval(review, true)}>Approve</button>
                  <button className="text-amber-700" onClick={() => setApproval(review, false)}>Reject</button>
                  <button className="text-red-700" onClick={() => deleteReview(review)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
