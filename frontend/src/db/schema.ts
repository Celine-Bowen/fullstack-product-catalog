import { relations, type InferInsertModel, type InferSelectModel } from "drizzle-orm";
import { bigint, bigserial, boolean, index, integer, numeric, pgTable, smallint, text, timestamp, uniqueIndex, varchar } from "drizzle-orm/pg-core";

const timestamps = {
  createdAt: timestamp("created_at", { mode: "string" }),
  updatedAt: timestamp("updated_at", { mode: "string" }),
};

export const users = pgTable(
  "users",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    emailVerifiedAt: timestamp("email_verified_at", { mode: "string" }),
    password: varchar("password", { length: 255 }).notNull(),
    rememberToken: varchar("remember_token", { length: 100 }),
    ...timestamps,
  },
  (table) => [uniqueIndex("users_email_unique").on(table.email)],
);

export const categories = pgTable(
  "categories",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 255 }).notNull(),
    description: text("description"),
    ...timestamps,
    deletedAt: timestamp("deleted_at", { mode: "string" }),
  },
  (table) => [uniqueIndex("categories_slug_unique").on(table.slug), index("categories_slug_index").on(table.slug)],
);

export const products = pgTable(
  "products",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    categoryId: bigint("category_id", { mode: "number" })
      .notNull()
      .references(() => categories.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 255 }).notNull(),
    description: text("description"),
    price: numeric("price", { precision: 10, scale: 2 }).notNull(),
    stockQty: integer("stock_qty").notNull().default(0),
    isPublished: boolean("is_published").notNull().default(false),
    ...timestamps,
    deletedAt: timestamp("deleted_at", { mode: "string" }),
  },
  (table) => [
    uniqueIndex("products_slug_unique").on(table.slug),
    index("products_slug_index").on(table.slug),
    index("products_is_published_index").on(table.isPublished),
  ],
);

export const reviews = pgTable(
  "reviews",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    productId: bigint("product_id", { mode: "number" })
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    reviewerName: varchar("reviewer_name", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    rating: smallint("rating").notNull(),
    body: text("body").notNull(),
    isApproved: boolean("is_approved").notNull().default(false),
    ...timestamps,
  },
  (table) => [index("reviews_email_index").on(table.email), index("reviews_is_approved_index").on(table.isApproved)],
);

export const categoriesRelations = relations(categories, ({ many }) => ({
  products: many(products),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  reviews: many(reviews),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  product: one(products, {
    fields: [reviews.productId],
    references: [products.id],
  }),
}));

export type User = InferSelectModel<typeof users>;
export type NewUser = InferInsertModel<typeof users>;

export type CategoryRow = InferSelectModel<typeof categories>;
export type NewCategory = InferInsertModel<typeof categories>;

export type ProductRow = InferSelectModel<typeof products>;
export type NewProduct = InferInsertModel<typeof products>;

export type ReviewRow = InferSelectModel<typeof reviews>;
export type NewReview = InferInsertModel<typeof reviews>;

type ApiTimestamps = {
  created_at: string;
  updated_at: string;
};

export type Category = Omit<CategoryRow, "createdAt" | "updatedAt" | "deletedAt"> &
  ApiTimestamps & {
    products_count?: number;
    products?: Product[];
  };

export type Product = Omit<ProductRow, "categoryId" | "stockQty" | "isPublished" | "createdAt" | "updatedAt" | "deletedAt"> &
  ApiTimestamps & {
    category_id: ProductRow["categoryId"];
    stock_qty: ProductRow["stockQty"];
    is_published: ProductRow["isPublished"];
    average_rating?: string | null;
    reviews_count?: number;
    category?: Category;
    reviews?: Review[];
  };

export type Review = Omit<ReviewRow, "productId" | "reviewerName" | "isApproved" | "createdAt" | "updatedAt"> &
  ApiTimestamps & {
    product_id: ReviewRow["productId"];
    reviewer_name: ReviewRow["reviewerName"];
    is_approved: ReviewRow["isApproved"];
    product?: Product;
  };

export type ProductFormValues = {
  id?: Product["id"];
  routeSlug?: Product["slug"];
  category_id: string;
  name: NewProduct["name"];
  slug: NewProduct["slug"];
  description: string;
  price: string;
  stock_qty: string;
  is_published: ProductRow["isPublished"];
};

export type ReviewFormValues = {
  reviewer_name: NewReview["reviewerName"];
  email: NewReview["email"];
  rating: string;
  body: NewReview["body"];
};

export type ReviewModerationValues = Pick<NewReview, "isApproved">;
