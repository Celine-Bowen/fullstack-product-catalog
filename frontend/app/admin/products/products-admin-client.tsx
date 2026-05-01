"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { AdminAuthPanel } from "@/components/AdminAuthPanel";
import { useAdminApi } from "@/hooks/use-admin-api";
import { useAdminToasts } from "@/hooks/use-admin-toasts";
import { clearAdminSession, readAdminSession, type AdminSession } from "@/lib/admin-auth";
import { getBrowserApiBase, type Category, type Paginated, type Product, type ProductFormValues, type Resource } from "@/lib/api";

const emptyForm: ProductFormValues = {
  category_id: "",
  name: "",
  slug: "",
  description: "",
  price: "",
  stock_qty: "0",
  is_published: false,
};

function buildOptimisticProduct(values: ProductFormValues, categories: Category[], optimisticId: number, fallback?: Product): Product {
  const category = categories.find((item) => item.id === Number(values.category_id));

  return {
    id: fallback?.id ?? optimisticId,
    category_id: Number(values.category_id),
    name: values.name,
    slug: values.slug,
    description: values.description || null,
    price: Number(values.price).toFixed(2),
    stock_qty: Number(values.stock_qty),
    is_published: values.is_published,
    average_rating: fallback?.average_rating ?? null,
    reviews_count: fallback?.reviews_count ?? 0,
    category,
    reviews: fallback?.reviews,
    created_at: fallback?.created_at ?? new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

export function ProductAdminClient() {
  const apiBase = useMemo(() => getBrowserApiBase(), []);
  const [session, setSession] = useState<AdminSession | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingProductId, setEditingProductId] = useState<number | undefined>();
  const { request } = useAdminApi(apiBase, session?.token);
  const { toasts, pushToast, dismissToast } = useAdminToasts();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormValues>({
    defaultValues: emptyForm,
  });

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setSession(readAdminSession());
    }, 0);

    return () => window.clearTimeout(timeout);
  }, []);

  async function loadData(authToken = session?.token) {
    setIsLoading(true);

    try {
      const [productResponse, categoryResponse] = await Promise.all([
        request<Paginated<Product>>("/products?include_unpublished=1", {}, authToken),
        request<Paginated<Category>>("/categories", {}, authToken),
      ]);

      setProducts(productResponse.data);
      setCategories(categoryResponse.data);
      pushToast("Admin catalog loaded.");
    } catch (error) {
      pushToast(error instanceof Error ? error.message : "Unable to load products.", "error");
    } finally {
      setIsLoading(false);
    }
  }

  function logout() {
    clearAdminSession();
    setSession(null);
    setProducts([]);
    setCategories([]);
    reset(emptyForm);
    setEditingProductId(undefined);
  }

  function editProduct(product: Product) {
    setEditingProductId(product.id);
    reset({
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

  async function submitProduct(values: ProductFormValues) {
    const previousProducts = products;
    const nextTemporaryId = -(products.length + 1);
    const optimisticProduct = buildOptimisticProduct(values, categories, nextTemporaryId, previousProducts.find((product) => product.id === values.id));
    const path = values.id ? `/products/${values.routeSlug}` : "/products";
    const method = values.id ? "PATCH" : "POST";

    setProducts((items) => {
      if (values.id) {
        return items.map((item) => (item.id === values.id ? optimisticProduct : item));
      }

      return [optimisticProduct, ...items];
    });

    try {
      const payload = {
        category_id: Number(values.category_id),
        name: values.name,
        slug: values.slug,
        description: values.description || null,
        price: Number(values.price),
        stock_qty: Number(values.stock_qty),
        is_published: values.is_published,
      };

      const response = await request<Resource<Product>>(path, {
        method,
        body: JSON.stringify(payload),
      });

      setProducts((items) => items.map((item) => (item.id === optimisticProduct.id ? response.data : item)));
      reset(emptyForm);
      setEditingProductId(undefined);
      pushToast(values.id ? "Product updated." : "Product created.");
    } catch (error) {
      setProducts(previousProducts);
      pushToast(error instanceof Error ? error.message : "Unable to save product.", "error");
    }
  }

  async function deleteProduct(product: Product) {
    if (!window.confirm(`Delete ${product.name}?`)) {
      return;
    }

    const previousProducts = products;
    setProducts((items) => items.filter((item) => item.id !== product.id));

    try {
      await request(`/products/${product.slug}`, { method: "DELETE" });
      pushToast("Product deleted.", "success", 5000);
    } catch (error) {
      setProducts(previousProducts);
      pushToast(error instanceof Error ? error.message : "Unable to delete product.", "error");
    }
  }

  async function togglePublished(product: Product) {
    const nextState = !product.is_published;
    setProducts((items) => items.map((item) => (item.id === product.id ? { ...item, is_published: nextState } : item)));

    try {
      await request(`/products/${product.slug}`, {
        method: "PATCH",
        body: JSON.stringify({ is_published: nextState }),
      });
      pushToast(nextState ? "Product published." : "Product unpublished.");
    } catch (error) {
      setProducts((items) => items.map((item) => (item.id === product.id ? product : item)));
      pushToast(error instanceof Error ? error.message : "Unable to update product.", "error");
    }
  }

  return (
    <div className="mt-6 space-y-6">
      <div className="fixed right-4 top-4 z-50 w-[min(24rem,calc(100vw-2rem))] space-y-2">
        {toasts.map((toast) => (
          <div key={toast.id} className={`flex items-start justify-between gap-3 rounded-md border px-4 py-3 text-sm shadow-sm ${toast.type === "success" ? "border-teal-200 bg-teal-50 text-teal-900 dark:border-teal-900 dark:bg-teal-950 dark:text-teal-100" : "border-red-200 bg-red-50 text-red-900 dark:border-red-900 dark:bg-red-950 dark:text-red-100"}`}>
            <span>{toast.message}</span>
            <button className="font-semibold" type="button" onClick={() => dismissToast(toast.id)}>
              Close
            </button>
          </div>
        ))}
      </div>

      <AdminAuthPanel
        apiBase={apiBase}
        session={session}
        onAuthenticated={(nextSession) => {
          setSession(nextSession);
          void loadData(nextSession.token);
        }}
        onLogout={logout}
      >
        <button className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 disabled:opacity-60 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800" type="button" onClick={() => loadData()} disabled={isLoading}>
          {isLoading ? "Loading..." : "Load products"}
        </button>
      </AdminAuthPanel>

      {!session ? null : (
        <>

      <form onSubmit={handleSubmit(submitProduct)} className="grid gap-4 rounded-lg border border-slate-200 bg-white p-4 md:grid-cols-2 dark:border-slate-800 dark:bg-slate-900">
        <label className="space-y-1">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Name</span>
          <input className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100" {...register("name", { required: "Please provide a product name.", maxLength: { value: 255, message: "The product name may not be greater than 255 characters." } })} />
          {errors.name ? <span className="text-xs text-red-700 dark:text-red-300">{errors.name.message}</span> : null}
        </label>

        <label className="space-y-1">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Slug</span>
          <input
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            {...register("slug", {
              required: "Please provide a URL-friendly product slug.",
              maxLength: { value: 255, message: "The product slug may not be greater than 255 characters." },
              pattern: { value: /^[A-Za-z0-9_-]+$/, message: "The product slug may only contain letters, numbers, dashes, and underscores." },
            })}
          />
          {errors.slug ? <span className="text-xs text-red-700 dark:text-red-300">{errors.slug.message}</span> : null}
        </label>

        <label className="space-y-1">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Category</span>
          <select className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100" {...register("category_id", { required: "Please choose a category for this product." })}>
            <option value="">Choose category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          {errors.category_id ? <span className="text-xs text-red-700 dark:text-red-300">{errors.category_id.message}</span> : null}
        </label>

        <label className="space-y-1">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Price</span>
          <input
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            inputMode="decimal"
            {...register("price", {
              required: "Please provide a product price.",
              validate: (value) => {
                const price = Number(value);

                if (Number.isNaN(price)) {
                  return "The product price must be a valid number.";
                }

                if (price < 0) {
                  return "The product price cannot be negative.";
                }

                if (price > 99999999.99) {
                  return "The product price is too large.";
                }

                return true;
              },
            })}
          />
          {errors.price ? <span className="text-xs text-red-700 dark:text-red-300">{errors.price.message}</span> : null}
        </label>

        <label className="space-y-1">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Stock</span>
          <input
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            inputMode="numeric"
            {...register("stock_qty", {
              required: "Please provide the available stock quantity.",
              validate: (value) => {
                const stock = Number(value);

                if (!Number.isInteger(stock)) {
                  return "The stock quantity must be a whole number.";
                }

                if (stock < 0) {
                  return "The stock quantity cannot be negative.";
                }

                return true;
              },
            })}
          />
          {errors.stock_qty ? <span className="text-xs text-red-700 dark:text-red-300">{errors.stock_qty.message}</span> : null}
        </label>

        <label className="flex items-center justify-between gap-3 rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-700 md:mt-6 dark:border-slate-800 dark:text-slate-300">
          <span className="font-medium">Published</span>
          <input type="checkbox" className="peer sr-only" {...register("is_published")} />
          <span className="relative h-6 w-11 rounded-full bg-slate-300 transition-colors after:absolute after:left-1 after:top-1 after:size-4 after:rounded-full after:bg-white after:shadow-sm after:transition-transform peer-checked:bg-teal-700 peer-checked:after:translate-x-5 peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-teal-700" />
        </label>

        <label className="space-y-1 md:col-span-2">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Description</span>
          <textarea className="min-h-24 w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100" {...register("description")} />
        </label>

        <div className="flex flex-col gap-2 sm:flex-row md:col-span-2">
          <button className="rounded-md bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-60" type="submit" disabled={isSubmitting}>
            {editingProductId ? "Update product" : "Create product"}
          </button>
          <button
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            type="button"
            onClick={() => {
              reset(emptyForm);
              setEditingProductId(undefined);
            }}
          >
            Clear
          </button>
        </div>
      </form>

      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <table className="min-w-[52rem] divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-slate-600 dark:bg-slate-900 dark:text-slate-300">
            <tr>
              <th className="sticky left-0 z-20 w-44 min-w-44 bg-slate-50 px-3 py-3 shadow-[1px_0_0_#e2e8f0] sm:px-4 dark:bg-slate-900 dark:shadow-[1px_0_0_#1e293b]">Product</th>
              <th className="px-3 py-3 sm:px-4">Category</th>
              <th className="px-3 py-3 sm:px-4">Price</th>
              <th className="px-3 py-3 sm:px-4">Stock</th>
              <th className="px-3 py-3 sm:px-4">Published</th>
              <th className="px-3 py-3 sm:px-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {products.map((product) => (
              <tr key={product.id}>
                <td className="sticky left-0 z-10 w-44 min-w-44 bg-white px-3 py-3 shadow-[1px_0_0_#e2e8f0] sm:px-4 dark:bg-slate-900 dark:shadow-[1px_0_0_#1e293b]">
                  <p className="font-medium text-slate-950 dark:text-slate-50">{product.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{product.slug}</p>
                </td>
                <td className="px-3 py-3 sm:px-4">{product.category?.name ?? product.category_id}</td>
                <td className="px-3 py-3 sm:px-4">{product.price}</td>
                <td className="px-3 py-3 sm:px-4">{product.stock_qty}</td>
                <td className="px-3 py-3 sm:px-4">
                  <button className="rounded-md border border-slate-300 px-3 py-1 text-xs font-medium dark:border-slate-700 dark:text-slate-200" type="button" onClick={() => togglePublished(product)}>
                    {product.is_published ? "Published" : "Draft"}
                  </button>
                </td>
                <td className="space-x-2 px-3 py-3 sm:px-4">
                  <button className="font-medium text-teal-700" type="button" onClick={() => editProduct(product)}>
                    Edit
                  </button>
                  <button className="font-medium text-red-700" type="button" onClick={() => deleteProduct(product)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
        </>
      )}
    </div>
  );
}
