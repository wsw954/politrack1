//app/api/users/[id]/tracker/bills/itemId]/provisions/[provId]/annotations/route.js

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import dbConnect from "@/config/db";
import mongoose from "mongoose";
import User from "@/models/User";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Shared utility to validate IDs
 */
function validIds({ userId, itemId, provId }) {
  return (
    mongoose.isValidObjectId(userId) &&
    mongoose.isValidObjectId(itemId) &&
    mongoose.isValidObjectId(provId)
  );
}

/**
 * GET /api/users/:id/tracker/bills/:itemId/provisions/:provId/annotations
 * Returns annotations for a specific provision of a tracked bill.
 */
export async function GET(req, context) {
  try {
    const session = await getServerSession(authOptions);
    if (!session)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { id: userId, itemId, provId } = await context.params;
    if (String(session.user.id) !== String(userId))
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });

    await dbConnect();

    if (!validIds({ userId, itemId, provId }))
      return NextResponse.json({ message: "Invalid ids" }, { status: 400 });

    // Find the specific tracked bill entry for this user
    const user = await User.findOne(
      { _id: userId, "tracker.bills.itemId": itemId },
      { "tracker.bills.$": 1 }
    ).lean();

    if (!user || !user.tracker?.bills?.length)
      return NextResponse.json(
        { message: "Tracked bill not found" },
        { status: 404 }
      );

    const tracked = user.tracker.bills[0];

    // Find if this provision already has annotations
    const provAnn =
      Array.isArray(tracked.provisionAnnotations) &&
      tracked.provisionAnnotations.find(
        (p) => String(p.provId) === String(provId)
      );

    const annotations = provAnn
      ? {
          generalNotes: provAnn.generalNotes ?? "",
          links: provAnn.links ?? [],
          attachments: provAnn.attachments ?? [],
          labels: provAnn.labels ?? [],
        }
      : { generalNotes: "", links: [], attachments: [], labels: [] };

    return NextResponse.json(annotations, { status: 200 });
  } catch (err) {
    console.error("GET provision annotations error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

/**
 * PUT /api/users/:id/tracker/bills/:itemId/provisions/:provId/annotations
 * Replaces (upserts) annotations for a provision.
 * Idempotent — same payload produces same DB state.
 */
export async function PUT(req, context) {
  try {
    const session = await getServerSession(authOptions);
    if (!session)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { id: userId, itemId, provId } = await context.params;
    if (String(session.user.id) !== String(userId))
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });

    await dbConnect();

    if (!validIds({ userId, itemId, provId }))
      return NextResponse.json({ message: "Invalid ids" }, { status: 400 });

    const body = await req.json();

    const safe = {
      provId: new mongoose.Types.ObjectId(provId),
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
      updatedAt: new Date(),
    };

    // If provision already exists in the array, update it. Otherwise, push new entry.
    const res = await User.updateOne(
      {
        _id: userId,
        "tracker.bills.itemId": itemId,
        "tracker.bills.provisionAnnotations.provId": provId,
      },
      {
        $set: {
          "tracker.bills.$[bill].provisionAnnotations.$[prov].generalNotes":
            safe.generalNotes,
          "tracker.bills.$[bill].provisionAnnotations.$[prov].links":
            safe.links,
          "tracker.bills.$[bill].provisionAnnotations.$[prov].attachments":
            safe.attachments,
          "tracker.bills.$[bill].provisionAnnotations.$[prov].labels":
            safe.labels,
          "tracker.bills.$[bill].updatedAt": new Date(),
        },
      },
      {
        arrayFilters: [
          { "bill.itemId": new mongoose.Types.ObjectId(itemId) },
          { "prov.provId": new mongoose.Types.ObjectId(provId) },
        ],
      }
    );

    // If no matching provision annotation existed, push it
    if (!res.modifiedCount) {
      await User.updateOne(
        { _id: userId, "tracker.bills.itemId": itemId },
        {
          $push: {
            "tracker.bills.$.provisionAnnotations": safe,
          },
          $set: { "tracker.bills.$.updatedAt": new Date() },
        }
      );
    }

    return NextResponse.json(
      { message: "Provision annotations saved", annotations: safe },
      { status: 200 }
    );
  } catch (err) {
    console.error("PUT provision annotations error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

/**
 * DELETE /api/users/:id/tracker/bills/:itemId/provisions/:provId/annotations
 * Removes annotations for a specific provision.
 */
export async function DELETE(req, context) {
  try {
    const session = await getServerSession(authOptions);
    if (!session)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { id: userId, itemId, provId } = await context.params;
    if (String(session.user.id) !== String(userId))
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });

    await dbConnect();

    if (!validIds({ userId, itemId, provId }))
      return NextResponse.json({ message: "Invalid ids" }, { status: 400 });

    const res = await User.updateOne(
      { _id: userId, "tracker.bills.itemId": itemId },
      {
        $pull: {
          "tracker.bills.$.provisionAnnotations": {
            provId: new mongoose.Types.ObjectId(provId),
          },
        },
        $set: { "tracker.bills.$.updatedAt": new Date() },
      }
    );

    if (!res.modifiedCount)
      return NextResponse.json(
        { message: "Provision annotation not found" },
        { status: 404 }
      );

    return NextResponse.json(
      { message: "Provision annotations cleared" },
      { status: 200 }
    );
  } catch (err) {
    console.error("DELETE provision annotations error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
