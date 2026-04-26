import Link from "next/link";
import { formatPrice, formatRating, type Product } from "@/lib/api";

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      href={`/products/${product.slug}`}
      className="group block overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition hover:border-teal-500 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-teal-400"
    >
      <div className="flex aspect-[4/3] items-end bg-[linear-gradient(135deg,#dbeafe_0%,#fef3c7_48%,#dcfce7_100%)] p-4">
        <span className="rounded-md bg-white/90 px-2 py-1 text-xs font-semibold text-slate-700 shadow-sm dark:bg-slate-950/90 dark:text-slate-200">
          {product.category?.name ?? "Catalog"}
        </span>
      </div>
      <div className="space-y-3 p-4">
        <div>
          <h2 className="text-base font-semibold text-slate-950 dark:text-slate-50">
            <span className="group-hover:text-teal-700 dark:group-hover:text-teal-300">{product.name}</span>
          </h2>
          <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{product.description}</p>
        </div>
        <div className="flex items-center justify-between gap-3 text-sm">
          <span className="font-semibold text-slate-950 dark:text-slate-50">{formatPrice(product.price)}</span>
          <span className="text-slate-600 dark:text-slate-300">{formatRating(product.average_rating)}</span>
        </div>
        <div className="flex items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
          <span>{product.stock_qty} in stock</span>
          <span>{product.reviews_count ?? 0} reviews</span>
        </div>
      </div>
    </Link>
  );
}
