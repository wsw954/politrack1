// app/api/users/[id]/tracker/tags/[tagId]/route.js
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { dbConnect } from "@/config/db";
import User from "@/models/User";
import { NextResponse } from "next/server";
import Tag from "@/models/Tag";

// GET – Fetch a single tracked tag
export async function GET(req, context) {
  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, tagId } = await context.params;
  if (String(session.user.id) !== String(id)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    await dbConnect();

    const user = await User.findById(id)
      .populate({ path: "tracker.tags.tagId", strictPopulate: false })
      .lean();

    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 });

    const trackedTag = user.tracker.tags.find(
      (item) => String(item.tagId?._id || item.tagId) === String(tagId)
    );

    if (!trackedTag) {
      return NextResponse.json({ error: "Tag not tracked" }, { status: 404 });
    }

    return NextResponse.json(trackedTag, { status: 200 });
  } catch (err) {
    console.error("GET /tracker/tags/[tagId] error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH – Update the note for a tracked tag
export async function PATCH(req, context) {
  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, tagId } = context.params;
  const { note } = await req.json();

  if (String(session.user.id) !== String(id)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    await dbConnect();

    const user = await User.findById(id);
    const tracked = user.tracker.tags.find(
      (item) => String(item.tagId) === String(tagId)
    );

    if (!tracked) {
      return NextResponse.json({ error: "Tag not tracked" }, { status: 404 });
    }

    tracked.note = note || "";
    tracked.updatedAt = new Date();
    await user.save();

    return NextResponse.json({ message: "Note updated" }, { status: 200 });
  } catch (err) {
    console.error("PATCH /tracker/tags/[tagId] error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE – Remove a tracked tag
export async function DELETE(req, context) {
  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, tagId } = context.params;
  if (String(session.user.id) !== String(id)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    await dbConnect();

    const user = await User.findById(id);
    const beforeCount = user.tracker.tags.length;

    user.tracker.tags = user.tracker.tags.filter(
      (item) => String(item.tagId) !== String(tagId)
    );

    const afterCount = user.tracker.tags.length;
    if (beforeCount === afterCount) {
      return NextResponse.json({ error: "Tag not tracked" }, { status: 404 });
    }

    await user.save();
    return NextResponse.json({ message: "Tag untracked" }, { status: 200 });
  } catch (err) {
    console.error("DELETE /tracker/tags/[tagId] error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
