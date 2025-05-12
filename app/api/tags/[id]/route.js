//app/api/tags/[id]/route.js
import Tag from "@/models/Tag";
import { dbConnect } from "@/config/db";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/api-protect";

export async function GET(_, { params }) {
  try {
    await dbConnect();
    const tag = await Tag.findById(params.id);
    if (!tag)
      return NextResponse.json({ error: "Tag not found" }, { status: 404 });
    return NextResponse.json(tag, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch tag." },
      { status: 500 }
    );
  }
}

export async function PUT(req, { params }) {
  try {
    await requireAdmin(req); // ✅ Only admin
    await dbConnect();
    const updates = await req.json();
    const updated = await Tag.findByIdAndUpdate(params.id, updates, {
      new: true,
    });
    if (!updated)
      return NextResponse.json({ error: "Tag not found" }, { status: 404 });
    return NextResponse.json(updated, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { error: err.message || "Unauthorized" },
      { status: 403 }
    );
  }
}

export async function DELETE(_, { params }) {
  try {
    await requireAdmin(); // ✅ Only admin
    await dbConnect();
    const deleted = await Tag.findByIdAndDelete(params.id);
    if (!deleted)
      return NextResponse.json({ error: "Tag not found" }, { status: 404 });
    return NextResponse.json({ message: "Tag deleted" }, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { error: err.message || "Unauthorized" },
      { status: 403 }
    );
  }
}
