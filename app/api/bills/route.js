// /app/api/bills/route.js
import { NextResponse } from "next/server";
import dbConnect from "@/config/db";
import Bill from "@/models/Bill";
import { requireAdmin } from "@/lib/auth/api-protect";

// Helpers
function parseNumber(value, fallback) {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

function parseSort(sortStr) {
  // Accepts e.g. "-updatedAt", "session", "-session,title"
  // Returns a Mongo sort object: { updatedAt: -1 } etc.
  if (!sortStr) return { updatedAt: -1 };
  const parts = String(sortStr)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const sort = {};
  for (const p of parts) {
    if (p.startsWith("-")) sort[p.slice(1)] = -1;
    else sort[p] = 1;
  }
  return Object.keys(sort).length ? sort : { updatedAt: -1 };
}

// GET /api/bills  -> List bills (lean payload + provisionCount), with pagination & sorting
export async function GET(req) {
  try {
    await dbConnect();

    const url = new URL(req.url);
    const page = parseNumber(url.searchParams.get("page"), 1);
    const limit = parseNumber(url.searchParams.get("limit"), 20);
    const sort = parseSort(url.searchParams.get("sort")); // default: -updatedAt

    // If you later add filters (session, status, text search), build a "match" object here
    const match = {};

    const pipeline = [
      { $match: match },
      { $sort: sort },
      {
        $project: {
          _id: 1,
          billNumber: 1,
          title: 1,
          session: 1,
          status: 1,
          updatedAt: 1,
          // Compute count without returning the full provisions array
          provisionCount: {
            $size: { $ifNull: ["$provisions", []] },
          },
        },
      },
      {
        $facet: {
          data: [{ $skip: (page - 1) * limit }, { $limit: limit }],
          total: [{ $count: "count" }],
        },
      },
    ];

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
  } catch (err) {
    console.error("GET /api/bills error:", err);
    return NextResponse.json(
      { message: "Failed to fetch bills." },
      { status: 500 }
    );
  }
}

// POST /api/bills  -> Create a bill (admin/seed path). Keep minimal validation here; your model enforces the rest.
export async function POST(req) {
  try {
    await requireAdmin(req);
    await dbConnect();

    const body = await req.json();

    // Minimal guardrails; rely on your Mongoose schema for deeper validation
    if (!body?.billNumber || !body?.title) {
      return NextResponse.json(
        { message: "billNumber and title are required." },
        { status: 400 }
      );
    }

    const doc = await Bill.create(body);

    // Return a lean confirmation payload
    return NextResponse.json(
      {
        message: "Bill created.",
        data: {
          _id: doc._id,
          billNumber: doc.billNumber,
          title: doc.title,
        },
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("POST /api/bills error:", err);
    // Simple duplicate handling example if your schema has unique billNumber
    if (err?.code === 11000) {
      return NextResponse.json(
        { message: "A bill with this unique field already exists." },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { message: "Failed to create bill." },
      { status: 500 }
    );
  }
}
