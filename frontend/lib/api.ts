export type { Category, NewCategory, NewProduct, NewReview, Product, ProductFormValues, Review, ReviewModerationValues } from "@/src/db/schema";
import type { Category, Product } from "@/src/db/schema";

export type Paginated<T> = {
  data: T[];
  links: {
    first: string | null;
    last: string | null;
    prev: string | null;
    next: string | null;
  };
  meta: {
    current_page: number;
    from: number | null;
    last_page: number;
    path: string;
    per_page: number;
    to: number | null;
    total: number;
  };
};

export type Resource<T> = {
  data: T;
};

export type ApiError = {
  message: string;
  errors: Record<string, string[]>;
};

const DEFAULT_BROWSER_API_URL = "http://localhost:8000/api/v1";
const DEFAULT_SERVER_API_URL = "http://backend:8000/api/v1";

export const PRODUCT_REVALIDATE_SECONDS = 60;
export const CATEGORY_REVALIDATE_SECONDS = 300;

export function getBrowserApiBase(): string {
  return process.env.NEXT_PUBLIC_API_URL ?? DEFAULT_BROWSER_API_URL;
}

function getServerApiBase(): string {
  return process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? DEFAULT_SERVER_API_URL;
}

function buildUrl(path: string, params?: Record<string, string | number | boolean | null | undefined>): string {
  const base = getServerApiBase().replace(/\/$/, "");
  const url = new URL(`${base}${path}`);

  Object.entries(params ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  });

  return url.toString();
}

async function apiFetch<T>(
  path: string,
  options: RequestInit & {
    params?: Record<string, string | number | boolean | null | undefined>;
    revalidate?: number;
  } = {},
): Promise<T> {
  const { params, revalidate, headers, ...requestOptions } = options;
  const response = await fetch(buildUrl(path, params), {
    ...requestOptions,
    headers: {
      Accept: "application/json",
      ...headers,
    },
    next: revalidate ? { revalidate } : undefined,
  });

  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export async function getProducts(params: {
  page?: number;
  category?: string;
  includeUnpublished?: boolean;
} = {}): Promise<Paginated<Product>> {
  return apiFetch<Paginated<Product>>("/products", {
    params: {
      page: params.page,
      category: params.category,
      include_unpublished: params.includeUnpublished,
    },
    revalidate: PRODUCT_REVALIDATE_SECONDS,
  });
}

export async function getProduct(slug: string): Promise<Resource<Product>> {
  return apiFetch<Resource<Product>>(`/products/${slug}`, { revalidate: PRODUCT_REVALIDATE_SECONDS });
}

export async function getCategories(params: { page?: number } = {}): Promise<Paginated<Category>> {
  return apiFetch<Paginated<Category>>("/categories", {
    params: {
      page: params.page,
    },
    revalidate: CATEGORY_REVALIDATE_SECONDS,
  });
}

export async function getCategory(slug: string): Promise<Resource<Category>> {
  return apiFetch<Resource<Category>>(`/categories/${slug}`, { revalidate: CATEGORY_REVALIDATE_SECONDS });
}

export async function getAllPublishedProductSlugs(): Promise<Array<{ slug: string }>> {
  const slugs: Array<{ slug: string }> = [];
  let page = 1;
  let lastPage = 1;

  do {
    const response = await getProducts({ page });
    slugs.push(
      ...response.data
        .filter((product) => product.is_published)
        .map((product) => ({
          slug: product.slug,
        })),
    );
    lastPage = response.meta.last_page;
    page += 1;
  } while (page <= lastPage);

  return slugs;
}

export async function getAllCategorySlugs(): Promise<Array<{ slug: string }>> {
  const slugs: Array<{ slug: string }> = [];
  let page = 1;
  let lastPage = 1;

  do {
    const response = await getCategories({ page });
    slugs.push(
      ...response.data.map((category) => ({
        slug: category.slug,
      })),
    );
    lastPage = response.meta.last_page;
    page += 1;
  } while (page <= lastPage);

  return slugs;
}

export function formatPrice(price: string): string {
  return new Intl.NumberFormat("en", {
    style: "currency",
    currency: "USD",
  }).format(Number(price));
}

export function formatRating(value?: string | null): string {
  if (!value) {
    return "No ratings";
  }

  return `${Number(value).toFixed(1)} / 5`;
}
