import { NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { buyers, buyerHistory } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { checkRateLimit } from "@/lib/ratelimit";
import { buyerFormValidator } from "@/lib/validation/buyer";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const buyer = await db
      .select()
      .from(buyers)
      .where(eq(buyers.id, id))
      .get();

    if (!buyer) {
      return NextResponse.json({ error: "Buyer not found" }, { status: 404 });
    }

    // 🚨 Ownership check -> allow viewing, gate editing
    const canEdit = buyer.ownerId === session.user?.id;

    // Parse tags for client form
    const buyerForClient = {
      ...buyer,
      tags: buyer.tags ? JSON.parse(buyer.tags as unknown as string) : [],
    } as any;

    // Fetch history (most recent first) - visible to all authenticated viewers
    const history = await db
      .select()
      .from(buyerHistory)
      .where(eq(buyerHistory.buyerId, id))
      .orderBy(desc(buyerHistory.changedAt))
      .limit(5);

    return NextResponse.json({ buyer: buyerForClient, history, canEdit });
  } catch (error: any) {
    console.error("GET buyer error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch buyer" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    // Rate limit per user
    if (!checkRateLimit(session.user?.id || "guest")) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const body = await req.json();
    const { updatedAt: clientUpdatedAt, ...updateData } = body;

    const parsed = buyerFormValidator.parse(updateData);

    const current = await db
      .select()
      .from(buyers)
      .where(eq(buyers.id, id))
      .get();

    if (!current) {
      return NextResponse.json({ error: "Buyer not found" }, { status: 404 });
    }

    // 🚨 Ownership check
    if (current.ownerId !== session.user?.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // 🚨 Concurrency check
    if (clientUpdatedAt && current.updatedAt) {
      const clientTime = new Date(clientUpdatedAt).getTime();
      const currentTime = new Date(current.updatedAt).getTime();
      if (clientTime !== currentTime) {
        return NextResponse.json(
          {
            error:
              "Record has been modified by another user. Please refresh and try again.",
          },
          { status: 409 }
        );
      }
    }

    // 🚨 Diff calculation
    const currentWithParsedTags = {
      ...current,
      tags: current.tags ? JSON.parse(current.tags) : [],
    };

    const diff: Record<string, any> = {};
    const fieldsToCheck = [
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
      "notes",
      "tags",
    ];

    fieldsToCheck.forEach((key) => {
      const oldValue = (currentWithParsedTags as any)[key];
      const newValue = (parsed as any)[key];
      if (key === "tags") {
        const oldTags = Array.isArray(oldValue) ? oldValue : [];
        const newTags = Array.isArray(newValue) ? newValue : [];
        if (JSON.stringify(oldTags.sort()) !== JSON.stringify(newTags.sort())) {
          diff[key] = { old: oldTags, new: newTags };
        }
      } else if (oldValue !== newValue) {
        diff[key] = { old: oldValue, new: newValue };
      }
    });

    // 🚨 Update values
    const updateValues = {
      ...parsed,
      tags: parsed.tags ? JSON.stringify(parsed.tags) : null,
      updatedAt: new Date(),
    };

    await db.update(buyers).set(updateValues).where(eq(buyers.id, id));

    if (Object.keys(diff).length > 0) {
      await db.insert(buyerHistory).values({
        buyerId: id,
        changedBy: session.user?.id, // ✅ always use id
        changedAt: new Date(),
        diff: JSON.stringify(diff),
      });
    }

    return NextResponse.json({
      success: true,
      message:
        Object.keys(diff).length > 0
          ? "Buyer updated successfully"
          : "No changes detected",
    });
  } catch (err: any) {
    console.error("PUT buyer error:", err);
    if (err.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation failed", details: err.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: err.message || "Failed to update buyer" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const current = await db
      .select()
      .from(buyers)
      .where(eq(buyers.id, id))
      .get();

    if (!current) {
      return NextResponse.json({ error: "Buyer not found" }, { status: 404 });
    }

    // 🚨 Ownership check
    if (current.ownerId !== session.user?.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

  await db.delete(buyers).where(eq(buyers.id, id));

    return NextResponse.json({
      success: true,
      message: "Buyer deleted successfully",
    });
  } catch (error: any) {
    console.error("DELETE buyer error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete buyer" },
      { status: 500 }
    );
  }
}
