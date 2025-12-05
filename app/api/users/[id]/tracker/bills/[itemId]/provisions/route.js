// app/api/users/[id]/tracker/bills/[itemId]/provisions/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import dbConnect from "@/config/db";
import mongoose from "mongoose";
import Bill from "@/models/Bill";
import User from "@/models/User";

function parseNumber(value, fallback) {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

// Allow only a few safe sort keys for nested docs
const ALLOWED_SORT_FIELDS = new Set(["section_number", "_id", "type"]);
function parseSort(sortStr) {
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

//Helper function
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

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req, context) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id: userId, itemId } = await context.params; // Next 15: await params

    if (String(session.user.id) !== String(userId)) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    await dbConnect();

    // Validate bill id
    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      return NextResponse.json({ message: "Invalid bill id" }, { status: 400 });
    }
    const billObjectId = new mongoose.Types.ObjectId(itemId);

    const url = new URL(req.url);
    const withParam = (url.searchParams.get("with") || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const includeMeta = withParam.includes("meta");

    const page = parseNumber(url.searchParams.get("page"), 1);
    const limit = parseNumber(url.searchParams.get("limit"), 50);
    const sort = parseSort(url.searchParams.get("sort"));
    const idsFilter = parseIdsParam(url.searchParams.get("ids"));

    // --- 1) Get provisions from Bill (same idea as untracked route) ---

    const pipeline = [
      { $match: { _id: billObjectId } },
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
      {
        $lookup: {
          from: "tags",
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

    if (Object.keys(sort).length) {
      pipeline.push({ $sort: sort });
    }

    pipeline.push({
      $facet: {
        data: [{ $skip: (page - 1) * limit }, { $limit: limit }],
        total: [{ $count: "count" }],
      },
    });

    const [aggResult] = await Bill.aggregate(pipeline);
    const data = aggResult?.data ?? [];
    const total = aggResult?.total?.[0]?.count ?? 0;
    const pages = Math.max(1, Math.ceil(total / limit));

    // --- 2) Get user-specific provision annotations for this bill ---

    const user = await User.findById(userId, {
      "tracker.bills": 1,
    }).lean();

    let annotationsByProvisionId = {};

    if (user?.tracker?.bills?.length) {
      const trackedBill = user.tracker.bills.find(
        (b) => String(b.itemId) === String(itemId) && b.itemType === "Bill"
      );

      if (trackedBill?.provisionAnnotations?.length) {
        const map = {};
        for (const pa of trackedBill.provisionAnnotations) {
          map[String(pa.provisionId)] = {
            generalNotes: pa.generalNotes,
            links: pa.links,
            attachments: pa.attachments,
            labels: pa.labels,
            anchorPath: pa.anchorPath,
            updatedAt: pa.updatedAt,
          };
        }
        annotationsByProvisionId = map;
      }
    }

    // --- 3) Shape response for frontend helper ---

    const responseBody = {
      list: data,
      annotationsByProvisionId,
    };

    if (includeMeta) {
      responseBody.meta = {
        page,
        limit,
        total,
        pages,
        sort,
      };
    }

    return NextResponse.json(responseBody, { status: 200 });
  } catch (err) {
    console.error("GET annotated provisions index error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
