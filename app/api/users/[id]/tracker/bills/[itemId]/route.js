// /app/api/users/[id]/tracker/bills/[itemId]/route.js

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { dbConnect } from "@/config/db";
import User from "@/models/User";
import Bill from "@/models/Bill";
import Politician from "@/models/Politician";
import Tag from "@/models/Tag";
import { NextResponse } from "next/server";

// GET — Fetch a single tracked bill (optionally join provisions)
export async function GET(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: userId, itemId: billId } = params;
  if (String(session.user.id) !== String(userId)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    await dbConnect();

    const includeProvisions =
      new URL(req.url).searchParams.get("includeProvisions") === "1";

    const user = await User.findOne(
      { _id: userId, "tracker.bills.itemId": billId },
      { "tracker.bills.$": 1 }
    ).lean();

    if (!user?.tracker?.bills?.length) {
      return NextResponse.json(
        { error: "Tracked bill not found" },
        { status: 404 }
      );
    }

    const tracked = user.tracker.bills[0];
    if (!includeProvisions) return NextResponse.json(tracked, { status: 200 });

    const bill = await Bill.findById(billId, { provisions: 1 }).lean();
    const byId = new Map(
      (bill?.provisions ?? []).map((p) => [String(p._id), p])
    );

    const provisions = (tracked.provisionAnnotations ?? []).map((ann) => ({
      provisionId: ann.provisionId,
      anchorPath: ann.anchorPath,
      provision: byId.get(String(ann.provisionId)) || null,
      generalNotes: ann.generalNotes,
      links: ann.links,
      attachments: ann.attachments,
      labels: ann.labels,
      updatedAt: ann.updatedAt,
    }));

    return NextResponse.json(
      {
        itemId: tracked.itemId,
        itemType: tracked.itemType,
        generalNotes: tracked.generalNotes,
        links: tracked.links,
        attachments: tracked.attachments,
        labels: tracked.labels,
        provisionAnnotations: provisions,
        createdAt: tracked.createdAt,
        updatedAt: tracked.updatedAt,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("GET tracked bill error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH - whole-bill annotations (no provisions here)
export async function PATCH(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: userId, itemId: billId } = params;
  if (String(session.user.id) !== String(userId)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const {
    generalNotes,
    addLinks = [],
    removeLinkIds = [],
    addAttachments = [],
    removeAttachmentIds = [],
    addLabels = [],
    removeLabelIds = [],
  } = body;

  try {
    await dbConnect();

    const base = "tracker.bills";
    const filter = { _id: userId, [`${base}.itemId`]: billId };

    const update = {};
    if (typeof generalNotes === "string") {
      update.$set = {
        [`${base}.$.generalNotes`]: generalNotes,
        [`${base}.$.updatedAt`]: new Date(),
      };
    } else {
      update.$set = { [`${base}.$.updatedAt`]: new Date() };
    }

    if (addLinks.length) {
      update.$push = { [`${base}.$.links`]: { $each: addLinks } };
    }
    if (addAttachments.length) {
      (update.$push ??= {})[`${base}.$.attachments`] = {
        $each: addAttachments,
      };
    }
    if (addLabels.length) {
      (update.$push ??= {})[`${base}.$.labels`] = { $each: addLabels };
    }

    if (removeLinkIds.length) {
      update.$pull = { [`${base}.$.links`]: { _id: { $in: removeLinkIds } } };
    }
    if (removeAttachmentIds.length) {
      (update.$pull ??= {})[`${base}.$.attachments`] = {
        _id: { $in: removeAttachmentIds },
      };
    }
    if (removeLabelIds.length) {
      (update.$pull ??= {})[`${base}.$.labels`] = {
        _id: { $in: removeLabelIds },
      };
    }

    const res = await User.updateOne(filter, update);
    if (!res.matchedCount) {
      return NextResponse.json(
        { error: "Tracked bill not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    console.error("PATCH tracked bill error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE — Remove a tracked bill
export async function DELETE(_req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: userId, itemId: billId } = params;
  if (String(session.user.id) !== String(userId)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    await dbConnect();

    const res = await User.updateOne(
      { _id: userId },
      { $pull: { "tracker.bills": { itemId: billId } } }
    );

    if (!res.modifiedCount) {
      return NextResponse.json(
        { error: "Tracked bill not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ message: "Bill untracked" }, { status: 200 });
  } catch (err) {
    console.error("DELETE tracked bill error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
