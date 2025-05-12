// /app/api/bills/route.js
import { NextResponse } from "next/server";
import dbConnect from "@/config/db";
import Bill from "@/models/Bill";
import { requireAdmin } from "@/lib/auth/api-protect";

export async function GET(req) {
  await dbConnect();

  const { searchParams } = new URL(req.url);
  const filters = {};

  const title = searchParams.get("title");
  const tag = searchParams.get("tag");
  const status = searchParams.get("status");

  if (title) {
    filters.title = { $regex: title, $options: "i" };
  }

  if (tag) {
    filters.tags = { $in: [tag] };
  }

  if (status) {
    filters["status.current_stage"] = status;
  }

  try {
    const bills = await Bill.find(filters);
    return NextResponse.json(bills);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch bills", details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    await requireAdmin(req);
    await dbConnect();
    const data = await req.json();
    const newBill = new Bill(data);
    const saved = await newBill.save();
    return NextResponse.json(saved, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err.message || "Unauthorized" },
      { status: 403 }
    );
  }
}
