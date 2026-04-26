"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/admin/products", label: "Products" },
  { href: "/admin/reviews", label: "Reviews" },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="mt-6 flex gap-2 overflow-x-auto border-b border-slate-200 pb-2 dark:border-slate-800" aria-label="Admin sections">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={`whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium ${
            pathname === link.href
              ? "bg-teal-50 text-teal-800 dark:bg-teal-950 dark:text-teal-200"
              : "text-slate-700 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-50"
          }`}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
