// app/api/politicians/route.js
import { NextResponse } from "next/server";
import dbConnect from "@/config/db";
import Politician from "@/models/Politician";
import { requireAdmin } from "@/lib/auth/api-protect";

export async function GET(req) {
  await dbConnect();

  const { searchParams } = new URL(req.url);
  const filters = {};

  const name = searchParams.get("name");
  const chamber = searchParams.get("chamber");
  const party = searchParams.get("party");

  // ✅ Filter by unique politician.name field (not full name)
  if (name) {
    filters.name = name; // exact match on unique internal field
  }

  if (chamber) {
    filters.chamber = chamber;
  }

  if (party) {
    filters.party = party;
  }

  try {
    const politicians = await Politician.find(filters);
    return NextResponse.json(politicians);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch politicians", details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    await requireAdmin(req);
    await dbConnect();
    const data = await req.json();
    const newPolitician = new Politician(data);
    const saved = await newPolitician.save();
    return NextResponse.json(saved, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err.message || "Unauthorized" },
      { status: 403 }
    );
  }
}
