import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { v4 as uuid } from "uuid";

export const buyers = sqliteTable("buyers", {
  id: text("id").primaryKey().$defaultFn(() => uuid()),
  fullName: text("full_name").notNull(),
  email: text("email"),
  phone: text("phone").notNull(),
  city: text("city").notNull(),
  propertyType: text("property_type").notNull(),
  bhk: text("bhk"),
  purpose: text("purpose").notNull(),
  budgetMin: integer("budget_min"),
  budgetMax: integer("budget_max"),
  timeline: text("timeline").notNull(),
  source: text("source").notNull(),
  status: text("status").notNull().default("New"),
  notes: text("notes"),
  tags: text("tags"), // Store as JSON string
  ownerId: text("owner_id").notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export const buyerHistory = sqliteTable("buyer_history", {
  id: text("id").primaryKey().$defaultFn(() => uuid()),
  buyerId: text("buyer_id").notNull(),
  changedBy: text("changed_by").notNull(),
  changedAt: integer("changed_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  diff: text("diff", { mode: "json" }).notNull(), // JSON string of changes
});

