//app/api/users/[id]/tracker/bills/itemId]/provisions/route.js
// /app/api/users/[id]/tracker/bills/[itemId]/provisions/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import dbConnect from "@/config/db";
import mongoose from "mongoose";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// --- helpers ---
function parseNumber(v, fb) {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : fb;
}

export async function GET(req, context) {
  try {
    const session = await getServerSession(authOptions);
    if (!session)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { id: userId, itemId } = await context.params; // Next 15
    if (String(session.user.id) !== String(userId)) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    await dbConnect();

    if (
      !mongoose.isValidObjectId(userId) ||
      !mongoose.isValidObjectId(itemId)
    ) {
      return NextResponse.json({ message: "Invalid ids" }, { status: 400 });
    }

    const url = new URL(req.url);
    const withParam = (url.searchParams.get("with") || "")
      .split(",")
      .map((s) => s.trim());
    const includeMeta = withParam.includes("meta");

    const page = parseNumber(url.searchParams.get("page"), 1);
    const limit = parseNumber(url.searchParams.get("limit"), 50);

    // Build pipeline: user -> specific tracked bill -> each provisionAnnotation
    const pipeline = [
      { $match: { _id: new mongoose.Types.ObjectId(userId) } },
      { $project: { tracker: 1 } },
      { $unwind: "$tracker.bills" },
      {
        $match: { "tracker.bills.itemId": new mongoose.Types.ObjectId(itemId) },
      },
      {
        $project: {
          provisionAnnotations: "$tracker.bills.provisionAnnotations",
        },
      },
      { $unwind: "$provisionAnnotations" },
      {
        $project: {
          provId: "$provisionAnnotations.provId",
          hasNotes: {
            $gt: [
              {
                $strLenCP: {
                  $ifNull: ["$provisionAnnotations.generalNotes", ""],
                },
              },
              0,
            ],
          },
          linksCount: {
            $size: { $ifNull: ["$provisionAnnotations.links", []] },
          },
          attachmentsCount: {
            $size: { $ifNull: ["$provisionAnnotations.attachments", []] },
          },
          labelsCount: {
            $size: { $ifNull: ["$provisionAnnotations.labels", []] },
          },
          updatedAt: { $ifNull: ["$provisionAnnotations.updatedAt", null] },
        },
      },
    ];

    if (includeMeta) {
      // Lookup bill once per row; filter its provisions to the provId we’re on,
      // then pull section_number/heading/type for display
      pipeline.push(
        {
          $lookup: {
            from: "bills",
            let: { bid: new mongoose.Types.ObjectId(itemId), pid: "$provId" },
            pipeline: [
              { $match: { $expr: { $eq: ["$_id", "$$bid"] } } },
              {
                $project: {
                  provision: {
                    $first: {
                      $filter: {
                        input: "$provisions",
                        as: "p",
                        cond: { $eq: ["$$p._id", "$$pid"] },
                      },
                    },
                  },
                },
              },
              {
                $project: {
                  "provision.section_number": 1,
                  "provision.heading": 1,
                  "provision.type": 1,
                },
              },
            ],
            as: "_bill",
          },
        },
        {
          $addFields: {
            meta: {
              $let: {
                vars: {
                  p: {
                    $ifNull: [{ $arrayElemAt: ["$_bill.provision", 0] }, null],
                  },
                },
                in: {
                  section_number: "$$p.section_number",
                  heading: "$$p.heading",
                  type: "$$p.type",
                },
              },
            },
          },
        },
        { $project: { _bill: 0 } }
      );
    }

    // Sort newest annotation updates first by default
    pipeline.push({ $sort: { updatedAt: -1, provId: 1 } });

    // Paginate
    pipeline.push({
      $facet: {
        data: [{ $skip: (page - 1) * limit }, { $limit: limit }],
        total: [{ $count: "count" }],
      },
    });

    const [result] = await mongoose.connection.db
      .collection("users")
      .aggregate(pipeline)
      .toArray();

    const data = result?.data ?? [];
    const total = result?.total?.[0]?.count ?? 0;
    const pages = Math.max(1, Math.ceil(total / limit));

    return NextResponse.json(
      {
        meta: { page, limit, total, pages, with: includeMeta ? ["meta"] : [] },
        data,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("GET annotated provisions index error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
