import Link from "next/link";
import { ProductCard } from "@/components/ProductCard";
import { SectionHeader } from "@/components/SectionHeader";
import { getCategories, getProducts, PRODUCT_REVALIDATE_SECONDS } from "@/lib/api";

export const revalidate = PRODUCT_REVALIDATE_SECONDS;

export default async function ProductsPage({
  searchParams,
}: {
  searchParams?: Promise<{ category?: string; page?: string }>;
}) {
  const params = await searchParams;
  const category = params?.category;
  const page = Number(params?.page ?? 1);
  const [products, categories] = await Promise.all([getProducts({ category, page }), getCategories()]);

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <SectionHeader title="Products" eyebrow="Catalog">
        <Link href="/products" className="text-sm font-semibold text-teal-700 hover:text-teal-900">
          Clear filter
        </Link>
      </SectionHeader>

      <div className="mt-6 flex gap-3 overflow-x-auto pb-2">
        {categories.data.map((item) => (
          <Link
            key={item.id}
            href={`/products?category=${item.slug}`}
            className={`whitespace-nowrap rounded-md border px-3 py-2 text-sm font-medium ${
              item.slug === category ? "border-teal-700 bg-teal-50 text-teal-800" : "border-slate-200 bg-white text-slate-700"
            }`}
          >
            {item.name}
          </Link>
        ))}
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {products.data.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </main>
  );
}
