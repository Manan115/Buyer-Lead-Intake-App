import { NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { buyers } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getServerSession } from "next-auth";

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { status } = await req.json();
  if (
    ![
      "New",
      "Qualified",
      "Contacted",
      "Visited",
      "Negotiation",
      "Converted",
      "Dropped",
    ].includes(status)
  ) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  // check ownership
  const buyer = await db.select().from(buyers).where(eq(buyers.id, params.id)).get();
  if (!buyer) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (buyer.ownerId !== session.user?.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await db
    .update(buyers)
    .set({ status, updatedAt: new Date() })
    .where(eq(buyers.id, params.id));

  return NextResponse.json({ success: true });
}
