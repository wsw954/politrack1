// /app/api/users/[id]/tracker/bills/[itemId]/route.js

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { dbConnect } from "@/config/db";
import User from "@/models/User";
import Bill from "@/models/Bill";
import Politician from "@/models/Politician";
import Tag from "@/models/Tag";
import { NextResponse } from "next/server";

export async function GET(req, context) {
  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: userId, itemId: billId } = await context.params;
  if (String(session.user.id) !== String(userId)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    await dbConnect();

    const includeProvisions =
      new URL(req.url).searchParams.get("includeProvisions") === "1";

    // 1) Find the single tracked subdoc
    const user = await User.findOne(
      { _id: userId, "tracker.bills.itemId": billId },
      { "tracker.bills.$": 1 }
    ).lean();

    if (!user?.tracker?.bills?.length) {
      return NextResponse.json({ error: "Not tracked" }, { status: 404 });
    }

    const tracked = user.tracker.bills[0];

    // 2) Load the bill with the fields your UI needs
    const billProjection = {
      title: 1,
      number: 1,
      session: 1,
      status: 1,
      summary: 1,
      tags: 1,
      sponsors: 1,
      ...(includeProvisions ? { provisions: 1 } : {}),
    };

    const bill = await Bill.findById(billId, billProjection)
      .populate([
        { path: "tags", select: "name color slug", options: { lean: true } },
        {
          path: "sponsor",
          select: "first_name last_name party chamber photo_url",
          options: { lean: true },
        },
      ])
      .lean();
    console.log(bill);
    if (!bill)
      return NextResponse.json({ error: "Bill not found" }, { status: 404 });

    // 3) Optionally join each provision annotation with the provision object
    let provisionAnnotations = tracked.provisionAnnotations || [];
    if (includeProvisions && Array.isArray(bill.provisions)) {
      const indexById = new Map(bill.provisions.map((p) => [String(p._id), p]));
      provisionAnnotations = provisionAnnotations.map((pa) => ({
        ...pa,
        provision: indexById.get(String(pa.provisionId)) || null,
      }));
    }

    // 4) Shape the response for your page
    return NextResponse.json(
      {
        itemId: {
          _id: String(bill._id),
          title: bill.title,
          number: bill.number,
          session: bill.session,
          status: bill.status,
          summary: bill.summary,
          tags: bill.tags,
          sponsor: bill.sponsor,
          ...(includeProvisions ? { provisions: bill.provisions } : {}),
        },
        generalNotes: tracked.generalNotes || "",
        links: tracked.links || [],
        attachments: tracked.attachments || [],
        labels: tracked.labels || [],
        provisionAnnotations,
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
