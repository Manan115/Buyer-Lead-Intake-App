import { NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { buyers } from "@/lib/db/schema";
import { stringify } from "csv-stringify/sync";
import { and, desc, eq, like, or } from "drizzle-orm";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const search = url.searchParams.get("search") || "";
  const city = url.searchParams.get("city");
  const propertyType = url.searchParams.get("propertyType");
  const status = url.searchParams.get("status");
  const timeline = url.searchParams.get("timeline");

  const conditions: any[] = [];
  if (search) {
    conditions.push(
      or(
        like(buyers.fullName, `%${search}%`),
        like(buyers.email, `%${search}%`),
        like(buyers.phone, `%${search}%`)
      )
    );
  }
  if (city) conditions.push(eq(buyers.city, city));
  if (propertyType) conditions.push(eq(buyers.propertyType, propertyType));
  if (status) conditions.push(eq(buyers.status, status));
  if (timeline) conditions.push(eq(buyers.timeline, timeline));

  const query = db.select().from(buyers).orderBy(desc(buyers.updatedAt));
  const rows = conditions.length > 0
    ? await query.where(and(...conditions))
    : await query;

  const csv = stringify(rows, {
    header: true,
    columns: [
      "id",
      "fullName",
      "email",
      "phone",
      "city",
      "propertyType",
      "bhk",
      "purpose",
      "budgetMin",
      "budgetMax",
      "timeline",
      "source",
      "status",
      "tags",
      "ownerId",
      "updatedAt",
    ],
  });

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": "attachment; filename=buyers.csv",
    },
  });
}
