import Link from "next/link";
import type { Category } from "@/lib/api";

export function CategoryCard({ category }: { category: Category }) {
  return (
    <Link
      href={`/categories/${category.slug}`}
      className="block rounded-lg border border-slate-200 bg-white p-5 shadow-sm hover:border-teal-500 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-teal-400"
    >
      <div className="mb-4 h-2 w-20 rounded-full bg-teal-500" />
      <h2 className="text-lg font-semibold text-slate-950 dark:text-slate-50">{category.name}</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{category.description}</p>
      <p className="mt-4 text-sm font-medium text-slate-700 dark:text-slate-300">{category.products_count ?? category.products?.length ?? 0} products</p>
    </Link>
  );
}
