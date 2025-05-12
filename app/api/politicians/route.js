// app/api/politicians/route.js
import { NextResponse } from "next/server";
import dbConnect from "@/config/db";
import Politician from "@/models/Politician";
import { requireAdmin } from "@/lib/auth/api-protect";

export async function GET(req) {
  await dbConnect();

  const { searchParams } = new URL(req.url);
  const filters = {};

  const chamber = searchParams.get("chamber");
  const party = searchParams.get("party");
  const district = searchParams.get("district");
  const name = searchParams.get("name");

  if (chamber) filters.chamber = chamber;
  if (party) filters.party = party;
  if (district) filters.district = district;

  if (name) {
    const [first_name, last_name] = name.split(" ");
    if (first_name && last_name) {
      filters.first_name = first_name;
      filters.last_name = last_name;
    }
  }

  const vote_topic = searchParams.get("vote_topic");
  const voted_yes = searchParams.get("voted_yes");

  if (vote_topic && voted_yes !== null) {
    filters.voting_history = {
      $elemMatch: {
        topic: vote_topic,
        vote: voted_yes === "true" ? "Yes" : { $ne: "Yes" },
      },
    };
  }

  const minAlign = parseInt(searchParams.get("party_alignment_min") || "0");
  const maxAlign = parseInt(searchParams.get("party_alignment_max") || "100");

  if (!isNaN(minAlign) && !isNaN(maxAlign)) {
    filters["consistency_meter.party_alignment"] = {
      $gte: minAlign,
      $lte: maxAlign,
    };
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
