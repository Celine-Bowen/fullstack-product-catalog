import { notFound } from "next/navigation";
import { SectionHeader } from "@/components/SectionHeader";
import { formatPrice, formatRating, getAllPublishedProductSlugs, getProduct } from "@/lib/api";

export const revalidate = 60;

export async function generateStaticParams() {
  return getAllPublishedProductSlugs();
}

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const response = await getProduct(slug).catch(() => null);

  if (!response?.data || !response.data.is_published) {
    notFound();
  }

  const product = response.data;

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="min-h-80 rounded-lg bg-[linear-gradient(135deg,#dbeafe_0%,#fef3c7_48%,#dcfce7_100%)]" />
        <div className="space-y-6">
          <SectionHeader title={product.name} eyebrow={product.category?.name ?? "Product"} />
          <p className="text-base leading-7 text-slate-600 dark:text-slate-300">{product.description}</p>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-800 dark:bg-slate-900">
              <p className="text-sm text-slate-500 dark:text-slate-400">Price</p>
              <p className="mt-1 text-lg font-semibold text-slate-950 dark:text-slate-50">{formatPrice(product.price)}</p>
            </div>
            <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-800 dark:bg-slate-900">
              <p className="text-sm text-slate-500 dark:text-slate-400">Rating</p>
              <p className="mt-1 text-lg font-semibold text-slate-950 dark:text-slate-50">{formatRating(product.average_rating)}</p>
            </div>
            <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-800 dark:bg-slate-900">
              <p className="text-sm text-slate-500 dark:text-slate-400">Stock</p>
              <p className="mt-1 text-lg font-semibold text-slate-950 dark:text-slate-50">{product.stock_qty}</p>
            </div>
          </div>
        </div>
      </div>

      <section className="mt-10">
        <SectionHeader title="Approved reviews" />
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {(product.reviews ?? []).map((review) => (
            <article key={review.id} className="rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-semibold text-slate-950 dark:text-slate-50">{review.reviewer_name}</h2>
                <span className="text-sm text-slate-600 dark:text-slate-300">{review.rating} / 5</span>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{review.body}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
