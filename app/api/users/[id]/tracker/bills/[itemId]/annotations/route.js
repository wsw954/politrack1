//app/api/users/[id]/tracker/bills/[itemId]/annotations/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import dbConnect from "@/config/db";
import mongoose from "mongoose";
import User from "@/models/User";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET  /api/users/:id/tracker/bills/:itemId/annotations
 * Returns the user's annotations for that tracked bill.
 */
export async function GET(req, context) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id: userId, itemId } = await context.params;
    if (String(session.user.id) !== String(userId)) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    await dbConnect();

    if (!mongoose.isValidObjectId(itemId)) {
      return NextResponse.json({ message: "Invalid bill id" }, { status: 400 });
    }

    // Find the user with only the specific tracked bill entry
    const user = await User.findOne(
      { _id: userId, "tracker.bills.itemId": itemId },
      { "tracker.bills.$": 1 } // positional projection
    ).lean();

    if (!user || !user.tracker?.bills?.length) {
      return NextResponse.json(
        { message: "Tracked bill not found" },
        { status: 404 }
      );
    }

    const tracked = user.tracker.bills[0];
    const annotations = {
      generalNotes: tracked.generalNotes ?? "",
      links: tracked.links ?? [],
      attachments: tracked.attachments ?? [],
      labels: tracked.labels ?? [],
    };

    return NextResponse.json(annotations, { status: 200 });
  } catch (err) {
    console.error("GET bill annotations error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

/**
 * PUT  /api/users/:id/tracker/bills/:itemId/annotations
 * Replaces (upserts) the annotations object for that tracked bill.
 * This operation is idempotent.
 */
export async function PUT(req, context) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id: userId, itemId } = await context.params;
    if (String(session.user.id) !== String(userId)) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    await dbConnect();

    if (!mongoose.isValidObjectId(itemId)) {
      return NextResponse.json({ message: "Invalid bill id" }, { status: 400 });
    }

    const body = await req.json();

    const safeAnnotations = {
      generalNotes:
        typeof body.generalNotes === "string" ? body.generalNotes : "",
      links: Array.isArray(body.links)
        ? body.links
            .filter((l) => l && typeof l.url === "string" && l.url.trim())
            .map((l) => ({
              url: String(l.url).trim(),
              title: l.title ? String(l.title).trim() : "",
              note: l.note ? String(l.note).trim() : "",
            }))
        : [],
      attachments: Array.isArray(body.attachments)
        ? body.attachments.map((a) => ({
            url: a.url ?? "",
            alt: a.alt ?? "",
            note: a.note ?? "",
          }))
        : [],
      labels: Array.isArray(body.labels)
        ? body.labels.map((lb) => ({
            label: lb.label ?? "",
            note: lb.note ?? "",
          }))
        : [],
    };

    const res = await User.updateOne(
      { _id: userId, "tracker.bills.itemId": itemId },
      {
        $set: {
          "tracker.bills.$.generalNotes": safeAnnotations.generalNotes,
          "tracker.bills.$.links": safeAnnotations.links,
          "tracker.bills.$.attachments": safeAnnotations.attachments,
          "tracker.bills.$.labels": safeAnnotations.labels,
          "tracker.bills.$.updatedAt": new Date(),
        },
      }
    );

    if (!res.modifiedCount) {
      return NextResponse.json(
        { message: "Tracked bill not found or not updated" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        message: "Annotations saved",
        annotations: safeAnnotations,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("PUT bill annotations error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

/**
 * DELETE  /api/users/:id/tracker/bills/:itemId/annotations
 * Clears the annotations (resets to empty values) for that tracked bill.
 */
export async function DELETE(req, context) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id: userId, itemId } = await context.params;
    if (String(session.user.id) !== String(userId)) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    await dbConnect();

    if (!mongoose.isValidObjectId(itemId)) {
      return NextResponse.json({ message: "Invalid bill id" }, { status: 400 });
    }

    const empty = {
      generalNotes: "",
      links: [],
      attachments: [],
      labels: [],
    };

    const res = await User.updateOne(
      { _id: userId, "tracker.bills.itemId": itemId },
      {
        $set: {
          "tracker.bills.$.generalNotes": "",
          "tracker.bills.$.links": [],
          "tracker.bills.$.attachments": [],
          "tracker.bills.$.labels": [],
          "tracker.bills.$.updatedAt": new Date(),
        },
      }
    );

    if (!res.modifiedCount) {
      return NextResponse.json(
        { message: "Tracked bill not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Annotations cleared", annotations: empty },
      { status: 200 }
    );
  } catch (err) {
    console.error("DELETE bill annotations error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
