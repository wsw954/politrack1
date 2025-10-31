// app/api/users/[id]/tracker/bills/route.js
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import dbConnect from "@/config/db";
import mongoose from "mongoose";
import User from "@/models/User";
import Bill from "@/models/Bill";
import Politician from "@/models/Politician";
import Tag from "@/models/Tag";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET: Return list of tracked bills
export async function GET(req, context) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params; // Next 15
    if (String(session.user.id) !== String(id)) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    await dbConnect();

    const userId = new mongoose.Types.ObjectId(id);

    // Aggregation from users -> tracker.bills -> lookup bills (+ provisionCount) -> lookup tags/politicians
    const [row] = await mongoose.connection.db
      .collection("users")
      .aggregate([
        { $match: { _id: userId } },
        { $project: { tracker: 1 } },
        { $unwind: "$tracker.bills" },

        // bring the bill document with a lean projection + provisionCount
        {
          $lookup: {
            from: "bills",
            let: { billId: "$tracker.bills.itemId" },
            pipeline: [
              { $match: { $expr: { $eq: ["$_id", "$$billId"] } } },
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
                  // compute count, do NOT include the provisions array itself
                  provisionCount: { $size: { $ifNull: ["$provisions", []] } },
                },
              },
              // resolve tag names
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
                    $map: { input: "$_tags", as: "t", in: "$$t.name" },
                  },
                },
              },
              { $project: { _tags: 0 } },
              // sponsor
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
              // co_sponsors
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
        { $unwind: { path: "$billDoc", preserveNullAndEmptyArrays: true } },

        // reconstruct each tracker entry but with itemId replaced by billDoc
        {
          $addFields: {
            "tracker.bills.itemId": "$billDoc",
          },
        },
        { $project: { billDoc: 0 } },

        // re-group back to a single array
        {
          $group: {
            _id: "$_id",
            bills: { $push: "$tracker.bills" },
          },
        },
      ])
      .toArray();

    const items = row?.bills ?? [];
    return NextResponse.json(items, { status: 200 });
  } catch (err) {
    console.error("GET /api/users/:id/tracker/bills error:", err);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST: Track a new bill (seed optional annotations)
export async function POST(req, context) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id: userId } = await context.params; // Next 15: params is thenable
    if (String(session.user.id) !== String(userId)) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    await dbConnect();

    const body = await req.json();

    // Only accept the bare minimum to "track" a bill now.
    const itemId = body?.itemId;
    if (!itemId) {
      return NextResponse.json({ message: "Missing itemId" }, { status: 400 });
    }
    if (!mongoose.isValidObjectId(itemId)) {
      return NextResponse.json({ message: "Invalid bill id" }, { status: 400 });
    }

    // Ensure bill exists
    const exists = await Bill.exists({ _id: itemId });
    if (!exists) {
      return NextResponse.json({ message: "Bill not found" }, { status: 404 });
    }

    // Prevent duplicates
    const alreadyTracked = await User.exists({
      _id: userId,
      "tracker.bills.itemId": itemId,
    });
    if (alreadyTracked) {
      return NextResponse.json(
        { message: "Bill already tracked" },
        { status: 409 }
      );
    }

    // Minimal tracked item — note that we DO NOT accept annotations here.
    const now = new Date();
    const newTracked = {
      itemId: new mongoose.Types.ObjectId(String(itemId)),
      itemType: "Bill",
      generalNotes: "",
      links: [],
      attachments: [],
      labels: [],
      provisionAnnotations: [],
      createdAt: now,
      updatedAt: now,
    };

    const res = await User.updateOne(
      { _id: userId },
      { $push: { "tracker.bills": newTracked } }
    );

    if (!res.modifiedCount) {
      return NextResponse.json(
        { message: "Unable to track bill" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        ok: true,
        itemId: String(itemId),
        message: "Bill tracked",
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("POST /api/users/:id/tracker/bills error:", err);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
