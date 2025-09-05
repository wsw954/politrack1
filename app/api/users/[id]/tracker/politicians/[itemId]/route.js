// /app/api/users/[id]/tracker/politicians/[itemId]/route.js
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { dbConnect } from "@/config/db";
import User from "@/models/User";
import Politician from "@/models/Politician";
import Bill from "@/models/Bill";
import { NextResponse } from "next/server";

// ✅ GET – Fetch a single tracked politician with full Politician document
export async function GET(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: userId, itemId: politicianId } = params;

  if (String(session.user.id) !== String(userId)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    await dbConnect();

    // 1) Find the tracked politician
    const user = await User.findOne(
      { _id: userId, "tracker.politicians.itemId": politicianId },
      { "tracker.politicians.$": 1 }
    ).lean();

    if (!user?.tracker?.politicians?.length)
      return NextResponse.json({ error: "Not tracked" }, { status: 404 });

    const tracked = user.tracker.politicians[0]; // this is the matched tracked item

    // 2) Load the politician details (include only fields you need)
    const politician = await Politician.findById(politicianId)
      .select(
        "first_name last_name party chamber district photo_url contact committee_assignments consistency_meter voting_history updatedAt"
      )
      .populate({
        path: "voting_history.bill_id",
        model: Bill,
        select: "_id title number session",
      })
      .lean();

    if (!politician) {
      return NextResponse.json(
        { error: "Politician not found" },
        { status: 404 }
      );
    }

    // 3) Shape response: politician data + annotations bundle
    return NextResponse.json(
      {
        politician: {
          _id: String(politician._id),
          first_name: politician.first_name,
          last_name: politician.last_name,
          party: politician.party,
          chamber: politician.chamber,
          district: politician.district,
          photo_url: politician.photo_url,
          contact: politician.contact,
          committee_assignments: politician.committee_assignments,
          consistency_meter: politician.consistency_meter,
          updatedAt: politician.updatedAt,
          voting_history: politician.voting_history ?? [],
        },
        annotations: {
          generalNotes: tracked.generalNotes || "",
          links: tracked.links || [],
          attachments: tracked.attachments || [],
          labels: tracked.labels || [],
          // convenience for UI
          generalNotesSnippet: (tracked.generalNotes || "").slice(0, 160),
          linksCount: (tracked.links || []).length,
          attachmentsCount: (tracked.attachments || []).length,
          labelsCount: (tracked.labels || []).length,
        },
        // user-tracker timestamps for sorting
        createdAt: tracked.createdAt,
        updatedAt: tracked.updatedAt,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("GET tracked politician error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH – Update the note for a tracked politician
export async function PATCH(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: userId, itemId: politicianId } = params;
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
  } = await req.json();

  try {
    await dbConnect();
    const base = "tracker.politicians";
    const filter = { _id: userId, [`${base}.itemId`]: politicianId };

    const update = { $set: { [`${base}.$.updatedAt`]: new Date() } };
    if (typeof generalNotes === "string") {
      update.$set[`${base}.$.generalNotes`] = generalNotes;
    }
    if (addLinks.length)
      (update.$push ??= {})[`${base}.$.links`] = { $each: addLinks };
    if (addAttachments.length)
      (update.$push ??= {})[`${base}.$.attachments`] = {
        $each: addAttachments,
      };
    if (addLabels.length)
      (update.$push ??= {})[`${base}.$.labels`] = { $each: addLabels };
    if (removeLinkIds.length)
      (update.$pull ??= {})[`${base}.$.links`] = {
        _id: { $in: removeLinkIds },
      };
    if (removeAttachmentIds.length)
      (update.$pull ??= {})[`${base}.$.attachments`] = {
        _id: { $in: removeAttachmentIds },
      };
    if (removeLabelIds.length)
      (update.$pull ??= {})[`${base}.$.labels`] = {
        _id: { $in: removeLabelIds },
      };

    const res = await User.updateOne(filter, update);
    if (!res.matchedCount) {
      return NextResponse.json(
        { error: "Tracked politician not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    console.error("PATCH tracked politician error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE – Remove a tracked politician
export async function DELETE(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: userId, itemId: politicianId } = params;
  if (String(session.user.id) !== String(userId)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    await dbConnect();

    const res = await User.updateOne(
      { _id: userId },
      { $pull: { "tracker.politicians": { itemId: politicianId } } }
    );

    if (!res.modifiedCount) {
      return NextResponse.json(
        { error: "Tracked politician not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Politician untracked" },
      { status: 200 }
    );
  } catch (err) {
    console.error("DELETE tracked politician error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
