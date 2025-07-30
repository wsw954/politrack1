//app/api/bills/route.js
import { NextResponse } from "next/server";
import dbConnect from "@/config/db";
import Bill from "@/models/Bill";
import Tag from "@/models/Tag";
import Politician from "@/models/Politician";
import { requireAdmin } from "@/lib/auth/api-protect";
import mongoose from "mongoose"; // at top

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

  //Filter using ObjectId string
  if (tag) {
    filters.tags = { $in: [new mongoose.Types.ObjectId(tag)] };
  }

  if (status) {
    filters["status.current_stage"] = status;
  }

  try {
    const count = await Bill.countDocuments(filters);
    const bills = await Bill.find(filters)
      .populate("tags", "name") // populate tags with their names
      .populate("sponsor", "first_name last_name")
      .populate("co_sponsors", "first_name last_name");

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
