import { notFound } from "next/navigation";
import { ProductCard } from "@/components/ProductCard";
import { SectionHeader } from "@/components/SectionHeader";
import { getCategories, getCategory } from "@/lib/api";

export const revalidate = 300;

export async function generateStaticParams() {
  const categories = await getCategories();

  return categories.data.map((category) => ({
    slug: category.slug,
  }));
}

export default async function CategoryDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const response = await getCategory(slug).catch(() => null);

  if (!response?.data) {
    notFound();
  }

  const category = response.data;

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <SectionHeader title={category.name} eyebrow="Category" />
      <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">{category.description}</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {(category.products ?? []).map((product) => (
          <ProductCard key={product.id} product={{ ...product, category }} />
        ))}
      </div>
    </main>
  );
}
