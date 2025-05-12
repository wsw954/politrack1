//app/api/tags/route.js
import Tag from "@/models/Tag";
import { dbConnect } from "@/config/db";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/api-protect";

export async function GET() {
  try {
    await dbConnect();
    const tags = await Tag.find().sort({ name: 1 });
    return NextResponse.json(tags, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch tags." },
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
