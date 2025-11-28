// /app/api/bills/[id]/route.js
import { NextResponse } from "next/server";
import dbConnect from "@/config/db";
import mongoose from "mongoose";

import { requireAdmin } from "@/lib/auth/api-protect";
import Bill from "@/models/Bill";

// Stabilize runtime/dynamic behavior for params in route handlers
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ---------- GET /api/bills/:id ----------
export async function GET(req, context) {
  try {
    await dbConnect();

    const { id } = await context.params; // <- use context.params (no destructuring in signature)

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: "Invalid bill id" }, { status: 400 });
    }

    const url = new URL(req.url);
    const withParam = (url.searchParams.get("with") || "")
      .split(",")
      .map((s) => s.trim());
    const includeProvisions = withParam.includes("provisions");

    if (includeProvisions) {
      // When explicitly requested, return provisions + count
      const bill = await Bill.findById(id, {
        provisions: 1,
        number: 1,
        title: 1,
        type: 1,
        session: 1,
        sponsor: 1,
        summary: 1,
        co_sponsors: 1,
        tags: 1,
        status: 1,
        effective_date: 1,
        updatedAt: 1,
      })
        .populate("sponsor", "first_name last_name chamber party")
        .populate("co_sponsors", "first_name last_name chamber party")
        .populate("tags", "name")
        .lean();

      if (!bill) {
        return NextResponse.json(
          { message: "Bill not found" },
          { status: 404 }
        );
      }

      const provisionCount = Array.isArray(bill.provisions)
        ? bill.provisions.length
        : 0;
      return NextResponse.json({ ...bill, provisionCount }, { status: 200 });
    }

    // Default path: use an inclusion-only projection; omit `provisions` by not listing it
    const bill = await Bill.findById(id, {
      number: 1,
      billNumber: 1,
      title: 1,
      type: 1,
      session: 1,
      sponsor: 1,
      summary: 1,
      co_sponsors: 1,
      tags: 1,
      status: 1,
      effective_date: 1,
      updatedAt: 1,
    })
      .populate("sponsor", "first_name last_name chamber party")
      .populate("co_sponsors", "first_name last_name chamber party")
      .populate("tags", "name")
      .lean();

    if (!bill) {
      return NextResponse.json({ message: "Bill not found" }, { status: 404 });
    }

    // Compute count without loading the array
    const [countDoc] = await Bill.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(id) } },
      {
        $project: {
          provisionCount: { $size: { $ifNull: ["$provisions", []] } },
        },
      },
    ]);

    const provisionCount = countDoc?.provisionCount ?? 0;
    return NextResponse.json({ ...bill, provisionCount }, { status: 200 });
  } catch (err) {
    console.error("GET /api/bills/:id error:", err);
    return NextResponse.json(
      { message: "Failed to fetch bill." },
      { status: 500 }
    );
  }
}

// ---------- PATCH /api/bills/:id ----------
export async function PATCH(req, context) {
  try {
    await requireAdmin(req);
    await dbConnect();

    const { id } = context.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: "Invalid bill id" }, { status: 400 });
    }

    const updates = await req.json();
    const updated = await Bill.findByIdAndUpdate(id, updates, { new: true });

    if (!updated) {
      return NextResponse.json({ message: "Bill not found" }, { status: 404 });
    }

    return NextResponse.json(updated, { status: 200 });
  } catch (err) {
    const status =
      err?.statusCode || (err?.name === "UnauthorizedError" ? 401 : 403);
    const message = err?.message || "Unauthorized";
    return NextResponse.json({ message }, { status });
  }
}

// ---------- DELETE /api/bills/:id ----------
export async function DELETE(req, context) {
  try {
    await requireAdmin(req);
    await dbConnect();

    const { id } = context.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: "Invalid bill id" }, { status: 400 });
    }

    const deleted = await Bill.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json({ message: "Bill not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Bill deleted" }, { status: 200 });
  } catch (err) {
    const status =
      err?.statusCode || (err?.name === "UnauthorizedError" ? 401 : 403);
    const message = err?.message || "Unauthorized";
    return NextResponse.json({ message }, { status });
  }
}
