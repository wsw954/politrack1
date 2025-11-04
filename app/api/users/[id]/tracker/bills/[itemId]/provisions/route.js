//app/api/users/[id]/tracker/bills/itemId]/provisions/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { listAnnotatedProvisionsIndexed } from "@/lib/services/tracker";
import dbConnect from "@/config/db";
import mongoose from "mongoose";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// --- helpers ---
function parseNumber(v, fb) {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : fb;
}

export async function GET(req, context) {
  try {
    const session = await getServerSession(authOptions);
    if (!session)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { id: userId, itemId } = await context.params; // Next 15: await params
    if (String(session.user.id) !== String(userId)) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const url = new URL(req.url);
    const withParam = (url.searchParams.get("with") || "")
      .split(",")
      .map((s) => s.trim());
    const includeMeta = withParam.includes("meta");

    const page = parseNumber(url.searchParams.get("page"), 1);
    const limit = parseNumber(url.searchParams.get("limit"), 50);

    const { meta, data } = await listAnnotatedProvisionsIndexed({
      userId,
      billId: itemId,
      page,
      limit,
      includeMeta,
    });

    return NextResponse.json({ meta, data }, { status: 200 });
  } catch (err) {
    console.error("GET annotated provisions index error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
