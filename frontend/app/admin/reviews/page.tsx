import { AdminNav } from "@/components/AdminNav";
import { SectionHeader } from "@/components/SectionHeader";
import { ReviewsAdminClient } from "./reviews-admin-client";

export default function AdminReviewsPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <SectionHeader title="Review admin" eyebrow="CSR" />
      <AdminNav />
      <ReviewsAdminClient />
    </main>
  );
}
