// app/api/bills/route.js
import { NextResponse } from "next/server";
import dbConnect from "@/config/db";
import Bill from "@/models/Bill";

export async function GET(req) {
  await dbConnect();

  const { searchParams } = new URL(req.url);
  const filters = {};

  // Basic filters
  const title = searchParams.get("title");
  const tag = searchParams.get("tag");
  const status = searchParams.get("status");

  if (title) {
    filters.title = { $regex: title, $options: "i" }; // case-insensitive partial match
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
