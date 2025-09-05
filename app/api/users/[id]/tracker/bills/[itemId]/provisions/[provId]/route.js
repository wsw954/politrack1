// app/api/users/[id]/tracker/bills/[itemId]/provisions/[provId]/route.js
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { dbConnect } from "@/config/db";
import { NextResponse } from "next/server";
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
    const filterBill = { _id: userId, [`${base}.itemId`]: billId };

    // Ensure the provision annotation entry exists
    await User.updateOne(filterBill, {
      $setOnInsert: {},
      $push: {
        [`${base}.$.provisionAnnotations`]: {
          provisionId: provId,
          anchorPath: anchorPath || null,
          generalNotes: "",
          links: [],
          attachments: [],
          labels: [],
          updatedAt: new Date(),
        },
      },
    });

    const filterProv = {
      _id: userId,
      [`${base}.itemId`]: billId,
      [`${base}.provisionAnnotations.provisionId`]: provId,
    };

    const setOps = {
      [`${base}.$.provisionAnnotations.$.updatedAt`]: new Date(),
    };
    if (typeof generalNotes === "string") {
      setOps[`${base}.$.provisionAnnotations.$.generalNotes`] = generalNotes;
    }
    if (anchorPath) {
      setOps[`${base}.$.provisionAnnotations.$.anchorPath`] = anchorPath;
    }

    const update = { $set: setOps };
    if (addLinks.length) {
      update.$push = {
        [`${base}.$.provisionAnnotations.$.links`]: { $each: addLinks },
      };
    }
    if (addAttachments.length) {
      (update.$push ??= {})[`${base}.$.provisionAnnotations.$.attachments`] = {
        $each: addAttachments,
      };
    }
    if (addLabels.length) {
      (update.$push ??= {})[`${base}.$.provisionAnnotations.$.labels`] = {
        $each: addLabels,
      };
    }

    if (removeLinkIds.length) {
      update.$pull = {
        [`${base}.$.provisionAnnotations.$.links`]: {
          _id: { $in: removeLinkIds },
        },
      };
    }
    if (removeAttachmentIds.length) {
      (update.$pull ??= {})[`${base}.$.provisionAnnotations.$.attachments`] = {
        _id: { $in: removeAttachmentIds },
      };
    }
    if (removeLabelIds.length) {
      (update.$pull ??= {})[`${base}.$.provisionAnnotations.$.labels`] = {
        _id: { $in: removeLabelIds },
      };
    }

    const res = await User.updateOne(filterProv, update);
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
