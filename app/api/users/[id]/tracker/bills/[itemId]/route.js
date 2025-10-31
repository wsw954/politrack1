// /app/api/users/[id]/tracker/bills/[itemId]/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import dbConnect from "@/config/db";
import mongoose from "mongoose";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/users/:id/tracker/bills/:itemId
 * Default: returns the tracked bill shell + populated bill doc with a lean projection,
 *          including computed `provisionCount`, and EXCLUDES annotations by default.
 * Opt-in:  append `?with=annotations` to include legacy annotations fields for back-compat.
 */
export async function GET(req, context) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id: userId, itemId: billId } = await context.params; // Next 15: await params
    if (String(session.user.id) !== String(userId)) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    await dbConnect();

    if (
      !mongoose.isValidObjectId(userId) ||
      !mongoose.isValidObjectId(billId)
    ) {
      return NextResponse.json({ message: "Invalid ids" }, { status: 400 });
    }

    const includeAnnotations = (new URL(req.url).searchParams.get("with") || "")
      .split(",")
      .map((s) => s.trim())
      .includes("annotations");

    const userObjectId = new mongoose.Types.ObjectId(userId);
    const billObjectId = new mongoose.Types.ObjectId(billId);

    // Aggregate from the user to the specific tracked bill, then lookup the bill doc
    const [row] = await mongoose.connection.db
      .collection("users")
      .aggregate([
        { $match: { _id: userObjectId } },
        { $project: { tracker: 1 } },
        { $unwind: "$tracker.bills" },
        { $match: { "tracker.bills.itemId": billObjectId } },

        // Bring in the bill doc with a lean projection + provisionCount
        {
          $lookup: {
            from: "bills",
            let: { bid: "$tracker.bills.itemId" },
            pipeline: [
              { $match: { $expr: { $eq: ["$_id", "$$bid"] } } },
              {
                $project: {
                  number: 1,
                  title: 1,
                  session: 1,
                  summary: 1,
                  status: 1,
                  tags: 1,
                  sponsor: 1,
                  co_sponsors: 1,
                  updatedAt: 1,
                  provisionCount: { $size: { $ifNull: ["$provisions", []] } },
                },
              },
              // tags -> names
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
                  tags: { $map: { input: "$_tags", as: "t", in: "$$t.name" } },
                },
              },
              { $project: { _tags: 0 } },
              // sponsor (lean)
              {
                $lookup: {
                  from: "politicians",
                  localField: "sponsor",
                  foreignField: "_id",
                  as: "_sponsor",
                },
              },
              {
                $addFields: {
                  sponsor: {
                    $let: {
                      vars: { s: { $arrayElemAt: ["$_sponsor", 0] } },
                      in: {
                        _id: "$$s._id",
                        first_name: "$$s.first_name",
                        last_name: "$$s.last_name",
                        party: "$$s.party",
                        chamber: "$$s.chamber",
                      },
                    },
                  },
                },
              },
              { $project: { _sponsor: 0 } },
              // co_sponsors (lean)
              {
                $lookup: {
                  from: "politicians",
                  localField: "co_sponsors",
                  foreignField: "_id",
                  as: "_co",
                },
              },
              {
                $addFields: {
                  co_sponsors: {
                    $map: {
                      input: "$_co",
                      as: "c",
                      in: {
                        _id: "$$c._id",
                        first_name: "$$c.first_name",
                        last_name: "$$c.last_name",
                        party: "$$c.party",
                        chamber: "$$c.chamber",
                      },
                    },
                  },
                },
              },
              { $project: { _co: 0 } },
            ],
            as: "billDoc",
          },
        },
        { $unwind: { path: "$billDoc", preserveNullAndEmptyArrays: false } },

        // Compose the outgoing shape
        {
          $project: {
            itemId: "$billDoc",
            createdAt: "$tracker.bills.createdAt",
            updatedAt: "$tracker.bills.updatedAt",

            // Annotations (optional back-compat)
            ...(includeAnnotations
              ? {
                  generalNotes: "$tracker.bills.generalNotes",
                  links: "$tracker.bills.links",
                  attachments: "$tracker.bills.attachments",
                  labels: "$tracker.bills.labels",
                  provisionAnnotations: "$tracker.bills.provisionAnnotations",
                }
              : {}),
          },
        },
        { $limit: 1 },
      ])
      .toArray();

    if (!row) {
      return NextResponse.json(
        { message: "Tracked bill not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(row, { status: 200 });
  } catch (err) {
    console.error("GET tracked bill error:", err);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/users/:id/tracker/bills/:itemId
 * Deprecated for annotations. Direct edits to annotations are now handled via:
 *   - PUT /api/users/:id/tracker/bills/:itemId/annotations
 *   - PUT /api/users/:id/tracker/bills/:itemId/provisions/:provId/annotations
 * This handler now returns a guidance response.
 */
export async function PATCH(_req, context) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id: userId } = await context.params;
    if (String(session.user.id) !== String(userId)) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    // Intentionally disallow legacy PATCH updates to annotations
    return NextResponse.json(
      {
        message:
          "This endpoint no longer updates annotations. Use the /annotations routes instead.",
        next: {
          billAnnotations: `/api/users/:id/tracker/bills/:itemId/annotations`,
          provisionAnnotations: `/api/users/:id/tracker/bills/:itemId/provisions/:provId/annotations`,
        },
      },
      { status: 409 } // or 410 Gone if you prefer
    );
  } catch (err) {
    console.error("PATCH tracked bill error:", err);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/users/:id/tracker/bills/:itemId
 * Remove the tracked bill entry (unchanged behavior).
 */
export async function DELETE(_req, context) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id: userId, itemId: billId } = await context.params;
    if (String(session.user.id) !== String(userId)) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    await dbConnect();

    const res = await mongoose.connection.db.collection("users").updateOne(
      { _id: new mongoose.Types.ObjectId(userId) },
      {
        $pull: {
          "tracker.bills": { itemId: new mongoose.Types.ObjectId(billId) },
        },
      }
    );

    if (!res.modifiedCount) {
      return NextResponse.json(
        { message: "Tracked bill not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Bill untracked" }, { status: 200 });
  } catch (err) {
    console.error("DELETE tracked bill error:", err);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
