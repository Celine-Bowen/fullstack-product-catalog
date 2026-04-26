import Link from "next/link";
import { formatPrice, formatRating, type Product } from "@/lib/api";

export function ProductCard({ product }: { product: Product }) {
  return (
    <article className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="flex aspect-[4/3] items-end bg-[linear-gradient(135deg,#dbeafe_0%,#fef3c7_48%,#dcfce7_100%)] p-4">
        <span className="rounded-md bg-white/90 px-2 py-1 text-xs font-semibold text-slate-700 shadow-sm">
          {product.category?.name ?? "Catalog"}
        </span>
      </div>
      <div className="space-y-3 p-4">
        <div>
          <h2 className="text-base font-semibold text-slate-950">
            <Link href={`/products/${product.slug}`} className="hover:text-teal-700">
              {product.name}
            </Link>
          </h2>
          <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-600">{product.description}</p>
        </div>
        <div className="flex items-center justify-between gap-3 text-sm">
          <span className="font-semibold text-slate-950">{formatPrice(product.price)}</span>
          <span className="text-slate-600">{formatRating(product.average_rating)}</span>
        </div>
        <div className="flex items-center justify-between gap-3 text-xs text-slate-500">
          <span>{product.stock_qty} in stock</span>
          <span>{product.reviews_count ?? 0} reviews</span>
        </div>
      </div>
    </article>
  );
}
