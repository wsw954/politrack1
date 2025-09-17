// app/api/users/[id]/tracker/bills/[itemId]/provisions/[provId]/route.js
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { dbConnect } from "@/config/db";
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import User from "@/models/User";
import Bill from "@/models/Bill";

// GET one provision annotation (optionally join provision text)
export async function GET(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: userId, itemId: billId, provId } = params;
  if (String(session.user.id) !== String(userId)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    await dbConnect();

    const withText = new URL(req.url).searchParams.get("withText") === "1";

    const user = await User.findOne(
      {
        _id: userId,
        "tracker.bills.itemId": billId,
        "tracker.bills.provisionAnnotations.provisionId": provId,
      },
      { "tracker.bills.$": 1 }
    ).lean();

    if (!user?.tracker?.bills?.length) {
      return NextResponse.json(
        { error: "Provision annotation not found" },
        { status: 404 }
      );
    }

    const tracked = user.tracker.bills[0];
    const ann = (tracked.provisionAnnotations || []).find(
      (a) => String(a.provisionId) === String(provId)
    );
    if (!ann)
      return NextResponse.json(
        { error: "Provision annotation not found" },
        { status: 404 }
      );

    if (!withText) return NextResponse.json(ann, { status: 200 });

    const bill = await Bill.findById(billId, { provisions: 1 }).lean();
    const prov =
      bill?.provisions?.find((p) => String(p._id) === String(provId)) || null;

    return NextResponse.json(
      {
        ...ann,
        provision: prov
          ? {
              _id: prov._id,
              section_number: prov.section_number,
              heading: prov.heading,
              legal_text: prov.legal_text,
              summary: prov.summary,
            }
          : null,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("GET provision annotation error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH (or POST): upsert + update a provision annotation
export async function PATCH(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: userId, itemId: billId, provId } = params;
  if (String(session.user.id) !== String(userId)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const {
    generalNotes,
    addLinks = [],
    removeLinkIds = [],
    addAttachments = [],
    removeAttachmentIds = [],
    addLabels = [],
    removeLabelIds = [],
    anchorPath,
  } = await req.json();

  try {
    await dbConnect();

    const base = "tracker.bills";
    const provisionObjectId = mongoose.Types.ObjectId.createFromHexString(
      String(provId)
    );

    // ------------------------------------------------------------
    // FIX #2: Only create the provision annotation entry if missing
    // (previous code always $push'ed, causing duplicates) :contentReference[oaicite:2]{index=2}
    // ------------------------------------------------------------
    const exists = await User.findOne(
      {
        _id: userId,
        [`${base}.itemId`]: billId,
        [`${base}.provisionAnnotations`]: {
          $elemMatch: { provisionId: provisionObjectId },
        },
      },
      { _id: 1 }
    ).lean();

    if (!exists) {
      await User.updateOne(
        { _id: userId, [`${base}.itemId`]: billId },
        {
          $push: {
            [`${base}.$.provisionAnnotations`]: {
              provisionId: provisionObjectId,
              anchorPath: anchorPath || null,
              generalNotes: "",
              links: [],
              attachments: [],
              labels: [],
              updatedAt: new Date(),
            },
          },
        }
      );
    }

    // ------------------------------------------------------------
    // FIX #1: Use arrayFilters to target the nested elements,
    // instead of double `$` positional operators. Your old draft
    // used paths like `${base}.$.provisionAnnotations.$.links`, which
    // rely on two anonymous positionals and are invalid. :contentReference[oaicite:3]{index=3}
    // ------------------------------------------------------------
    const billObjectId = mongoose.Types.ObjectId.createFromHexString(
      String(billId)
    );
    const arrayFilters = [
      { "bill.itemId": billObjectId },
      { "prov.provisionId": provisionObjectId },
    ];

    // Build $set
    const setOps = {
      [`${base}.$[bill].provisionAnnotations.$[prov].updatedAt`]: new Date(),
    };
    if (typeof generalNotes === "string") {
      setOps[`${base}.$[bill].provisionAnnotations.$[prov].generalNotes`] =
        generalNotes;
    }
    if (anchorPath) {
      setOps[`${base}.$[bill].provisionAnnotations.$[prov].anchorPath`] =
        anchorPath;
    }

    const update = { $set: setOps };

    // Build $push
    if (addLinks.length) {
      update.$push = {
        [`${base}.$[bill].provisionAnnotations.$[prov].links`]: {
          $each: addLinks,
        },
      };
    }
    if (addAttachments.length) {
      (update.$push ??= {})[
        `${base}.$[bill].provisionAnnotations.$[prov].attachments`
      ] = { $each: addAttachments };
    }
    if (addLabels.length) {
      (update.$push ??= {})[
        `${base}.$[bill].provisionAnnotations.$[prov].labels`
      ] = { $each: addLabels };
    }

    // Build $pull
    if (removeLinkIds.length) {
      update.$pull = {
        [`${base}.$[bill].provisionAnnotations.$[prov].links`]: {
          _id: { $in: removeLinkIds },
        },
      };
    }
    if (removeAttachmentIds.length) {
      (update.$pull ??= {})[
        `${base}.$[bill].provisionAnnotations.$[prov].attachments`
      ] = { _id: { $in: removeAttachmentIds } };
    }
    if (removeLabelIds.length) {
      (update.$pull ??= {})[
        `${base}.$[bill].provisionAnnotations.$[prov].labels`
      ] = { _id: { $in: removeLabelIds } };
    }

    const res = await User.updateOne(
      { _id: userId, [`${base}.itemId`]: billId },
      update,
      { arrayFilters }
    );

    if (!res.matchedCount) {
      return NextResponse.json(
        { error: "Tracked bill/provision not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    console.error("PATCH provision annotation error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE provision annotation block entirely
export async function DELETE(_req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: userId, itemId: billId, provId } = params;
  if (String(session.user.id) !== String(userId)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    await dbConnect();

    const base = "tracker.bills";
    const res = await User.updateOne(
      { _id: userId, [`${base}.itemId`]: billId },
      { $pull: { [`${base}.$.provisionAnnotations`]: { provisionId: provId } } }
    );

    if (!res.modifiedCount) {
      return NextResponse.json(
        { error: "Provision annotation not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { message: "Provision annotation removed" },
      { status: 200 }
    );
  } catch (err) {
    console.error("DELETE provision annotation error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
