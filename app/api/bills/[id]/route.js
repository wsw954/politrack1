// Handle GET/PATCH/DELETE for single item
// /app/api/bills/[id]/route.js
import Bill from "@/models/Bill";
import { dbConnect } from "@/config/db";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/api-protect";

export async function GET(req, { params }) {
  try {
    await dbConnect();
    const { id } = params;

    const bill = await Bill.findById(id);
    if (!bill) {
      return NextResponse.json({ message: "Bill not found" }, { status: 404 });
    }

    return NextResponse.json(bill, { status: 200 });
  } catch (error) {
    console.error("❌ API ERROR:", error);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}

export async function PATCH(req, { params }) {
  try {
    await requireAdmin(req);
    await dbConnect();
    const updates = await req.json();

    const updated = await Bill.findByIdAndUpdate(params.id, updates, {
      new: true,
    });
    if (!updated) {
      return NextResponse.json({ message: "Bill not found" }, { status: 404 });
    }

    return NextResponse.json(updated, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { error: err.message || "Unauthorized" },
      { status: 403 }
    );
  }
}

export async function DELETE(req, { params }) {
  try {
    await requireAdmin(req);
    await dbConnect();

    const deleted = await Bill.findByIdAndDelete(params.id);
    if (!deleted) {
      return NextResponse.json({ message: "Bill not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Bill deleted" }, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { error: err.message || "Unauthorized" },
      { status: 403 }
    );
  }
}
