"use client";

import { FormEvent, useMemo, useState } from "react";
import { getBrowserApiBase, type Category, type Paginated, type Product } from "@/lib/api";

type ProductForm = {
  id?: number;
  routeSlug?: string;
  category_id: string;
  name: string;
  slug: string;
  description: string;
  price: string;
  stock_qty: string;
  is_published: boolean;
};

const emptyForm: ProductForm = {
  category_id: "",
  name: "",
  slug: "",
  description: "",
  price: "",
  stock_qty: "0",
  is_published: false,
};

export function ProductAdminClient() {
  const apiBase = useMemo(() => getBrowserApiBase(), []);
  const [token, setToken] = useState(() => (typeof window === "undefined" ? "" : window.localStorage.getItem("catalog_admin_token") ?? ""));
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState<ProductForm>(emptyForm);
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

  async function loadData() {
    const [productResponse, categoryResponse] = await Promise.all([
      request<Paginated<Product>>("/products?include_unpublished=1"),
      fetch(`${apiBase}/categories`, { headers: { Accept: "application/json" } }).then((response) => response.json() as Promise<Paginated<Category>>),
    ]);

    setProducts(productResponse.data);
    setCategories(categoryResponse.data);
  }

  function updateToken(value: string) {
    setToken(value);
    window.localStorage.setItem("catalog_admin_token", value);
  }

  function editProduct(product: Product) {
    setForm({
      id: product.id,
      routeSlug: product.slug,
      category_id: String(product.category_id),
      name: product.name,
      slug: product.slug,
      description: product.description ?? "",
      price: product.price,
      stock_qty: String(product.stock_qty),
      is_published: product.is_published,
    });
  }

  async function submitProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    const payload = {
      category_id: Number(form.category_id),
      name: form.name,
      slug: form.slug,
      description: form.description,
      price: Number(form.price),
      stock_qty: Number(form.stock_qty),
      is_published: form.is_published,
    };

    const path = form.id ? `/products/${form.routeSlug}` : "/products";
    const method = form.id ? "PATCH" : "POST";

    await request(path, {
      method,
      body: JSON.stringify(payload),
    });

    setForm(emptyForm);
    setMessage(form.id ? "Product updated." : "Product created.");
    await loadData();
  }

  async function deleteProduct(product: Product) {
    if (!window.confirm(`Delete ${product.name}?`)) {
      return;
    }

    await request(`/products/${product.slug}`, { method: "DELETE" });
    setMessage("Product deleted.");
    await loadData();
  }

  async function togglePublished(product: Product) {
    const nextState = !product.is_published;
    setProducts((items) => items.map((item) => (item.id === product.id ? { ...item, is_published: nextState } : item)));

    try {
      await request(`/products/${product.slug}`, {
        method: "PATCH",
        body: JSON.stringify({ is_published: nextState }),
      });
      setMessage(nextState ? "Product published." : "Product unpublished.");
    } catch (error) {
      setProducts((items) => items.map((item) => (item.id === product.id ? product : item)));
      setMessage(error instanceof Error ? error.message : "Unable to update product.");
    }
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

      <button className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700" type="button" onClick={() => loadData().catch((error: Error) => setMessage(error.message))}>
        Load products
      </button>

      {message ? <p className="rounded-md bg-teal-50 px-3 py-2 text-sm text-teal-800">{message}</p> : null}

      <form onSubmit={submitProduct} className="grid gap-4 rounded-lg border border-slate-200 bg-white p-4 md:grid-cols-2">
        <input className="rounded-md border border-slate-300 px-3 py-2 text-sm" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Name" required />
        <input className="rounded-md border border-slate-300 px-3 py-2 text-sm" value={form.slug} onChange={(event) => setForm({ ...form, slug: event.target.value })} placeholder="slug" required />
        <select className="rounded-md border border-slate-300 px-3 py-2 text-sm" value={form.category_id} onChange={(event) => setForm({ ...form, category_id: event.target.value })} required>
          <option value="">Choose category</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        <input className="rounded-md border border-slate-300 px-3 py-2 text-sm" value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} placeholder="Price" required />
        <input className="rounded-md border border-slate-300 px-3 py-2 text-sm" value={form.stock_qty} onChange={(event) => setForm({ ...form, stock_qty: event.target.value })} placeholder="Stock" required />
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" checked={form.is_published} onChange={(event) => setForm({ ...form, is_published: event.target.checked })} />
          Published
        </label>
        <textarea className="min-h-24 rounded-md border border-slate-300 px-3 py-2 text-sm md:col-span-2" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="Description" />
        <div className="flex gap-2 md:col-span-2">
          <button className="rounded-md bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800" type="submit">
            {form.id ? "Update product" : "Create product"}
          </button>
          <button className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700" type="button" onClick={() => setForm(emptyForm)}>
            Clear
          </button>
        </div>
      </form>

      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-slate-600">
            <tr>
              <th className="sticky left-0 bg-slate-50 px-4 py-3">Product</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3">Published</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {products.map((product) => (
              <tr key={product.id}>
                <td className="sticky left-0 bg-white px-4 py-3 font-medium text-slate-950">{product.name}</td>
                <td className="px-4 py-3">{product.price}</td>
                <td className="px-4 py-3">{product.stock_qty}</td>
                <td className="px-4 py-3">
                  <button className="rounded-md border border-slate-300 px-3 py-1 text-xs" onClick={() => togglePublished(product)}>
                    {product.is_published ? "Published" : "Draft"}
                  </button>
                </td>
                <td className="space-x-2 px-4 py-3">
                  <button className="text-teal-700" onClick={() => editProduct(product)}>Edit</button>
                  <button className="text-red-700" onClick={() => deleteProduct(product)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
