"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const links = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Products" },
  { href: "/categories", label: "Categories" },
  { href: "/admin/products", label: "Admin" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="border-b border-slate-200 bg-white">
      <nav className="mx-auto max-w-7xl px-4 py-3 sm:px-6 md:flex md:items-center md:justify-between md:gap-6 lg:px-8">
        <div className="flex min-h-11 items-center justify-between gap-3">
          <Link href="/" className="text-lg font-semibold tracking-normal text-slate-950" onClick={() => setIsOpen(false)}>
            Product Catalog
          </Link>
          <button
            type="button"
            className="inline-flex size-10 items-center justify-center rounded-md border border-slate-300 text-slate-700 hover:bg-slate-100 md:hidden"
            aria-label="Toggle navigation menu"
            aria-expanded={isOpen}
            onClick={() => setIsOpen((value) => !value)}
          >
            <span className="flex w-5 flex-col gap-1.5">
              <span className="h-0.5 rounded-full bg-current" />
              <span className="h-0.5 rounded-full bg-current" />
              <span className="h-0.5 rounded-full bg-current" />
            </span>
          </button>
        </div>
        <div className={`${isOpen ? "flex" : "hidden"} flex-col gap-1 pt-3 md:flex md:flex-row md:flex-wrap md:justify-end md:gap-2 md:pt-0`}>
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-md px-3 py-2 text-sm font-medium hover:bg-slate-100 hover:text-slate-950 ${
                pathname === link.href ? "bg-slate-100 text-slate-950" : "text-slate-700"
              }`}
              onClick={() => setIsOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
