//app/api/bills/route.js
import { NextResponse } from "next/server";
import dbConnect from "@/config/db";
import Bill from "@/models/Bill";
import Tag from "@/models/Tag";
import Politician from "@/models/Politician";
import { requireAdmin } from "@/lib/auth/api-protect";
import mongoose from "mongoose"; // at top
import FilterBar from "@/components/bills/FilterBar";

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
  if (tag && mongoose.Types.ObjectId.isValid(tag)) {
    filters.tags = { $in: [new mongoose.Types.ObjectId(tag)] };
  }

  if (status) {
    filters["status.current_stage"] = status;
  }

  try {
    const bills = await Bill.find(filters, {
      number: 1,
      title: 1,
      type: 1,
      session: 1,
      sponsor: 1,
      co_sponsors: 1,
      tags: 1,
      status: 1,
      effective_date: 1,
      source_url: 1,
      updatedAt: 1,
      "provisions._id": 1, // << lightweight handle for provisionCount
      summary: 1,
    })
      .populate("tags", "name") // populate tags with their names
      .populate("sponsor", "first_name last_name")
      .lean();

    // Add provisionCount and omit the provisions array from the list payload
    const result = (bills ?? []).map((b) => {
      const provisionCount = Array.isArray(b.provisions)
        ? b.provisions.length
        : 0;
      const { provisions, ...rest } = b;
      return { ...rest, provisionCount };
    });

    return NextResponse.json(result);
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
