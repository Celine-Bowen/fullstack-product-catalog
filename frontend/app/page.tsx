import Link from "next/link";
import { CategoryCard } from "@/components/CategoryCard";
import { ProductCard } from "@/components/ProductCard";
import { SectionHeader } from "@/components/SectionHeader";
import { getCategories, getProducts } from "@/lib/api";

export const revalidate = 60;

export default async function Home() {
  const [products, categories] = await Promise.all([getProducts(), getCategories()]);
  const featuredProducts = products.data.slice(0, 4);

  return (
    <main>
      <section className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8 lg:py-14">
          <div className="flex flex-col justify-center gap-6">
            <SectionHeader eyebrow="Catalog" title="Product Catalog & Review Platform" />
            <p className="max-w-2xl text-base leading-7 text-slate-600">
              Browse published products, review category collections, and inspect approved customer feedback from a Laravel API backed by Redis caching.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/products" className="rounded-md bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800">
                Browse products
              </Link>
              <Link href="/categories" className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-white">
                View categories
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {featuredProducts.map((product) => (
              <Link
                key={product.id}
                href={`/products/${product.slug}`}
                className="min-h-32 rounded-lg border border-slate-200 bg-white p-4 shadow-sm hover:border-teal-500"
              >
                <div className="mb-4 h-16 rounded-md bg-[linear-gradient(135deg,#dbeafe_0%,#fef3c7_55%,#dcfce7_100%)]" />
                <p className="text-sm font-semibold text-slate-950">{product.name}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <SectionHeader title="Featured products" />
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <section className="border-t border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <SectionHeader title="Categories" />
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {categories.data.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
