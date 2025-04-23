// app/api/politicians/route.js
import { NextResponse } from "next/server";
import dbConnect from "@/config/db";
import Politician from "@/models/Politician";

export async function GET(req) {
  await dbConnect();

  const { searchParams } = new URL(req.url);
  const filters = {};

  // Basic filters
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

  // Advanced filter: topic-based voting
  const vote_topic = searchParams.get("vote_topic");
  const voted_yes = searchParams.get("voted_yes"); // "true" or "false"

  if (vote_topic && voted_yes !== null) {
    filters.voting_history = {
      $elemMatch: {
        topic: vote_topic,
        vote: voted_yes === "true" ? "Yes" : { $ne: "Yes" },
      },
    };
  }

  // Advanced filter: consistency range
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
