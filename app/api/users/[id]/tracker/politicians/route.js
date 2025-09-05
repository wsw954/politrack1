//app/api/users/[id]/tracker/politicians/route.js

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { dbConnect } from "@/config/db";
import User from "@/models/User";
import Politician from "@/models/Politician";
import { NextResponse } from "next/server";

// GET: Return list of tracked politicians
export async function GET(_req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: userId } = params;
  if (String(session.user.id) !== String(userId)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    await dbConnect();

    const user = await User.findById(userId)
      .select("tracker.politicians")
      .populate({
        path: "tracker.politicians.itemId",
        model: Politician,
        select:
          "first_name last_name party chamber district photo_url contact committee_assignments voting_history createdAt",
      })
      .lean();

    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 });

    // Shape the response so the frontend has what it needs at-a-glance
    const items = (user.tracker?.politicians ?? []).map((t) => ({
      // Core identity for list rendering / linking
      politicianId: String(t.itemId?._id || t.itemId),
      // Populated politician (safe subset already selected)
      politician: t.itemId || null,
      // Tracker annotation teaser(s)
      generalNotes: t.generalNotes || "",
      generalNotesSnippet: (t.generalNotes || "").slice(0, 160), // optional: teaser
      labels: t.labels || [],
      linksCount: (t.links || []).length,
      attachmentsCount: (t.attachments || []).length,
      // Useful timestamps for sorting/UX
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
    }));

    return NextResponse.json(items, { status: 200 });
  } catch (err) {
    console.error("GET /tracker/politicians error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST: Track a new politician
export async function POST(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: userId } = params;
  if (String(session.user.id) !== String(userId)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const {
    itemId,
    generalNotes = "",
    links = [],
    attachments = [],
    labels = [],
  } = await req.json();
  if (!itemId) {
    return NextResponse.json({ error: "Missing itemId" }, { status: 400 });
  }

  try {
    await dbConnect();

    const politician = await Politician.findById(itemId);
    if (!politician) {
      return NextResponse.json(
        { error: "Politician not found" },
        { status: 404 }
      );
    }

    const user = await User.findById(userId);
    const alreadyTracked = user.tracker.politicians.some(
      (entry) => String(entry.itemId) === String(itemId)
    );

    if (alreadyTracked) {
      return NextResponse.json(
        { error: "Politician already tracked" },
        { status: 400 }
      );
    }

    user.tracker.politicians.push({
      itemId,
      itemType: "Politician",
      generalNotes,
      links,
      attachments,
      labels,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await user.save();

    return NextResponse.json(
      { message: "Politician tracked" },
      { status: 201 }
    );
  } catch (err) {
    console.error("POST /tracker/politicians error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
