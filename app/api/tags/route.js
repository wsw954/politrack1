//app/api/tags/route.js
import Tag from "@/models/Tag";
import { dbConnect } from "@/config/db";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/api-protect";

export async function GET(req) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const filters = {};

    // Optional: exact match by name
    const name = searchParams.get("name");
    if (name) {
      filters.name = name;
    }

    // Optional: keyword search (partial match on name or any keyword)
    const q = searchParams.get("q");
    if (q) {
      filters.$or = [
        { name: { $regex: q, $options: "i" } },
        { keywords: { $regex: q, $options: "i" } },
      ];
    }

    const tags = await Tag.find(filters).sort({ name: 1 });
    return NextResponse.json(tags, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to fetch tags.", details: err.message },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    await requireAdmin(req); // ✅ Only admin
    await dbConnect();
    const body = await req.json();
    const newTag = new Tag(body);
    const saved = await newTag.save();
    return NextResponse.json(saved, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err.message || "Unauthorized" },
      { status: 403 }
    );
  }
}
