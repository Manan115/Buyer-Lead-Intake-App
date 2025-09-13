import { NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { buyers } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { checkRateLimit } from "@/lib/ratelimit";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!checkRateLimit(session.user?.id || "guest")) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const { status } = await req.json();
  const allowed = ["New","Qualified","Contacted","Visited","Negotiation","Converted","Dropped"];
  if (!allowed.includes(status)) return NextResponse.json({ error: "Invalid status" }, { status: 400 });

  const buyer = await db.select().from(buyers).where(eq(buyers.id, params.id)).get();
  if (!buyer) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (buyer.ownerId !== session.user?.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await db.update(buyers).set({ status, updatedAt: new Date() }).where(eq(buyers.id, params.id));
  return NextResponse.json({ success: true });
}