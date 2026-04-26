import { render, screen } from "@testing-library/react";
import { CategoryCard } from "@/components/CategoryCard";
import type { Category } from "@/lib/api";

const category: Category = {
  id: 1,
  name: "Home Diagnostics",
  slug: "home-diagnostics",
  description: "Simple diagnostic tools for private at-home use.",
  products_count: 3,
  created_at: "2026-04-26T20:31:31.000000Z",
  updated_at: "2026-04-26T20:31:31.000000Z",
};

describe("CategoryCard", () => {
  it("renders the category details and links to the category page", () => {
    render(<CategoryCard category={category} />);

    expect(screen.getByRole("link", { name: /home diagnostics/i })).toHaveAttribute("href", "/categories/home-diagnostics");
    expect(screen.getByText("Simple diagnostic tools for private at-home use.")).toBeInTheDocument();
    expect(screen.getByText("3 products")).toBeInTheDocument();
  });

  it("falls back to the products array length when products_count is missing", () => {
    render(
      <CategoryCard
        category={{
          ...category,
          products_count: undefined,
          products: [
            {
              id: 10,
              category_id: 1,
              name: "Home Test Organizer",
              slug: "home-test-organizer",
              description: "Storage pouch for home diagnostic tools.",
              price: "16.00",
              stock_qty: 8,
              is_published: true,
              created_at: "2026-04-26T20:31:31.000000Z",
              updated_at: "2026-04-26T20:31:31.000000Z",
            },
          ],
        }}
      />,
    );

    expect(screen.getByText("1 products")).toBeInTheDocument();
  });
});
