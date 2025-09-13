import { NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { buyers } from "@/lib/db/schema";
import { buyerFormValidator } from "@/lib/validation/buyer";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { records } = await req.json();
    if (!Array.isArray(records)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }
    if (records.length > 200) {
      return NextResponse.json({ error: "Max 200 rows allowed" }, { status: 400 });
    }

    const valid: any[] = [];
    const errors: Array<{ row: number; message: string }> = [];

    records.forEach((raw: any, idx: number) => {
      try {
        const parsed = buyerFormValidator.parse(raw);
        valid.push(parsed);
      } catch (e: any) {
        const msg = e?.errors?.map((x: any) => x.message).join("; ") || "Invalid row";
        errors.push({ row: idx + 1, message: msg });
      }
    });

    if (valid.length > 0) {
      await db.transaction(async (tx) => {
        for (const parsed of valid) {
          await tx.insert(buyers).values({
            ...parsed,
            tags: parsed.tags ? JSON.stringify(parsed.tags) : "[]",
            ownerId: session.user.id,
            updatedAt: new Date(),
          });
        }
      });
    }

    return NextResponse.json({ success: true, inserted: valid.length, errors });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
