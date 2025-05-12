// Handle GET/PATCH/DELETE for single item
// /app/api/politicians/[id]/route.js
import Politician from "@/models/Politician";
import { dbConnect } from "@/config/db";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/api-protect";

export async function GET(req, { params }) {
  try {
    await dbConnect();
    const { id } = params;

    if (!id) {
      return NextResponse.json({ message: "ID is required" }, { status: 400 });
    }

    const politician = await Politician.findById(id);
    if (!politician) {
      return NextResponse.json(
        { message: "Politician not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(politician, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}

export async function PATCH(req, { params }) {
  try {
    await requireAdmin(req);
    await dbConnect();
    const updates = await req.json();

    const updated = await Politician.findByIdAndUpdate(params.id, updates, {
      new: true,
    });
    if (!updated) {
      return NextResponse.json(
        { message: "Politician not found" },
        { status: 404 }
      );
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

    const deleted = await Politician.findByIdAndDelete(params.id);
    if (!deleted) {
      return NextResponse.json(
        { message: "Politician not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Politician deleted" },
      { status: 200 }
    );
  } catch (err) {
    return NextResponse.json(
      { error: err.message || "Unauthorized" },
      { status: 403 }
    );
  }
}
