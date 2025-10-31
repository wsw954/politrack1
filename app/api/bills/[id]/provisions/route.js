//app/api/bills/[id]/provisions/route.js
import { NextResponse } from "next/server";
import dbConnect from "@/config/db";
import mongoose from "mongoose";
import Bill from "@/models/Bill";

// Helpers
function parseNumber(value, fallback) {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

// Allow only a few safe sort keys for nested docs
const ALLOWED_SORT_FIELDS = new Set(["section_number", "_id", "type"]);
function parseSort(sortStr) {
  // Accepts e.g. "section_number", "-section_number", "type", "-type"
  const def = { section_number: 1 };
  if (!sortStr) return def;

  const parts = String(sortStr)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const sort = {};
  for (const p of parts) {
    const desc = p.startsWith("-");
    const key = desc ? p.slice(1) : p;
    if (!ALLOWED_SORT_FIELDS.has(key)) continue;
    sort[key] = desc ? -1 : 1;
  }
  return Object.keys(sort).length ? sort : def;
}

function parseIdsParam(idsParam) {
  if (!idsParam) return null;
  const raw = String(idsParam)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const good = [];
  for (const id of raw) {
    if (mongoose.Types.ObjectId.isValid(id)) {
      good.push(new mongoose.Types.ObjectId(id));
    }
  }
  return good.length ? good : null;
}

// GET /api/bills/:id/provisions
// Returns a lean, paginated, sortable list of provisions for the bill.
// Shape: { meta: { page, limit, total, pages, sort }, data: [ ...provisions ] }
export async function GET(req, { params }) {
  try {
    await dbConnect();

    const { id } = await params; // <-- params is not a promise
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: "Invalid bill id" }, { status: 400 });
    }

    const url = new URL(req.url);
    const page = parseNumber(url.searchParams.get("page"), 1);
    const limit = parseNumber(url.searchParams.get("limit"), 50);
    const sort = parseSort(url.searchParams.get("sort"));
    const idsFilter = parseIdsParam(url.searchParams.get("ids")); // optional: filter by list of provision _ids

    // Aggregation pipeline:
    // 1) Match the bill
    // 2) Unwind provisions
    // 3) Optional filter by provision ids
    // 4) Project lean provision fields + legalTextCount
    // 5) Lookup tag names for display
    // 6) Project final fields (tags -> names)
    // 7) Sort / paginate via $facet
    const pipeline = [
      { $match: { _id: new mongoose.Types.ObjectId(id) } },
      { $unwind: "$provisions" },
    ];

    if (idsFilter) {
      pipeline.push({ $match: { "provisions._id": { $in: idsFilter } } });
    }

    pipeline.push(
      {
        $project: {
          _id: "$provisions._id",
          section_number: "$provisions.section_number",
          heading: "$provisions.heading",
          summary: { $ifNull: ["$provisions.summary", ""] },
          why_it_matters: "$provisions.why_it_matters",
          tags: "$provisions.tags", // will transform to names after $lookup
          type: { $ifNull: ["$provisions.type", "standard"] },
          legalTextCount: {
            $size: { $ifNull: ["$provisions.legal_text", []] },
          },
        },
      },
      // Lookup tag names
      {
        $lookup: {
          from: "tags", // collection name for your Tag model
          localField: "tags",
          foreignField: "_id",
          as: "_tags",
        },
      },
      {
        $addFields: {
          tags: {
            $map: {
              input: "$_tags",
              as: "t",
              in: "$$t.name",
            },
          },
        },
      },
      { $project: { _tags: 0 } }
    );

    // Build a $sort stage from the parsed sort object
    if (Object.keys(sort).length) {
      pipeline.push({ $sort: sort });
    }

    pipeline.push({
      $facet: {
        data: [{ $skip: (page - 1) * limit }, { $limit: limit }],
        total: [{ $count: "count" }],
      },
    });

    const [result] = await Bill.aggregate(pipeline);
    const data = result?.data ?? [];
    const total = result?.total?.[0]?.count ?? 0;
    const pages = Math.max(1, Math.ceil(total / limit));

    return NextResponse.json(
      {
        meta: { page, limit, total, pages, sort },
        data,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/bills/:id/provisions error:", error);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}
