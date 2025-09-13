import { NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { buyers, buyerHistory } from "@/lib/db/schema";
import { buyerFormValidator } from "@/lib/validation/buyer";
import { authOptions } from "@/lib/auth";
import { eq, or, like, desc, and, sql } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { checkRateLimit } from "@/lib/ratelimit";
import { v4 as uuid } from "uuid";


// ---------------- POST ----------------
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    const userId = session.user.id;
    // Rate limit per user
    if (!checkRateLimit(userId)) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const body = await req.json();
    const parsed = buyerFormValidator.parse(body);

    // Pre-generate id so we can reference it in history
    const newId = uuid();

    await db.insert(buyers).values({
      id: newId,
      ...parsed,
      tags: parsed.tags ? JSON.stringify(parsed.tags) : "[]", // ✅ always store JSON string
      ownerId: session.user.id, // ✅ logged-in user
      updatedAt: new Date(),
    });

    // Write creation history entry with new values
    const diff: Record<string, { old: any; new: any }> = {};
    (Object.keys(parsed) as Array<keyof typeof parsed>).forEach((k) => {
      const v = parsed[k as keyof typeof parsed] as any;
      diff[k as string] = { old: null, new: v };
    });
    await db.insert(buyerHistory).values({
      buyerId: newId,
      changedBy: session.user.id,
      changedAt: new Date(),
      diff: JSON.stringify(diff),
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Buyer POST Error:", err);

    if (err.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation failed", details: err.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}

// ---------------- GET ----------------
export async function GET(req: Request) {
  try {
    // Require authentication to list buyers
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(req.url);
    const search = url.searchParams.get("search") || "";
    const city = url.searchParams.get("city");
    const propertyType = url.searchParams.get("propertyType");
    const status = url.searchParams.get("status");
    const timeline = url.searchParams.get("timeline");
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = 10;
    const offset = (page - 1) * limit;

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

    const baseQuery = db
      .select()
      .from(buyers)
      .orderBy(desc(buyers.updatedAt))
      .limit(limit)
      .offset(offset);

    const items = conditions.length > 0
      ? await baseQuery.where(and(...conditions))
      : await baseQuery;

    // Total count with same filters
    const countQuery = db
      .select({ count: sql<number>`count(*)` })
      .from(buyers);
    const totalRow = conditions.length > 0
      ? await countQuery.where(and(...conditions))
      : await countQuery;
    const total = Array.isArray(totalRow) ? (totalRow[0]?.count ?? 0) : (totalRow as any)?.count ?? 0;

    const parsedResults = items.map((buyer) => ({
      ...buyer,
      tags: buyer.tags ? JSON.parse(buyer.tags) : [],
    }));


    return NextResponse.json({ items: parsedResults, total, page, limit });
  } catch (err: any) {
    console.error("Buyer GET Error:", err);
    return NextResponse.json(
      { error: "Failed to fetch buyers" },
      { status: 500 }
    );
  }
}
