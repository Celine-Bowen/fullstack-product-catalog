import { SectionHeader } from "@/components/SectionHeader";
import { ProductAdminClient } from "./products-admin-client";

export default function AdminProductsPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <SectionHeader title="Product admin" eyebrow="CSR" />
      <ProductAdminClient />
    </main>
  );
}
