// app/api/users/[id]/tracker/tags/[itemId]/route.js
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

  const { id, itemId } = await context.params;
  if (String(session.user.id) !== String(id)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    await dbConnect();

    const user = await User.findById(id)
      .populate({
        path: "tracker.tags.itemId", // ✅ populate full Tag document
        model: "Tag",
      })
      .lean();

    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 });

    const trackedTag = user.tracker.tags.find(
      (item) => String(item.itemId?._id || item.itemId) === String(itemId)
    );

    if (!trackedTag) {
      return NextResponse.json({ error: "Tag not tracked" }, { status: 404 });
    }

    return NextResponse.json(trackedTag, { status: 200 });
  } catch (err) {
    console.error("GET /tracker/tags/[itemId] error:", err);
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

  const { id, itemId } = context.params;
  const { note } = await req.json();

  if (String(session.user.id) !== String(id)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    await dbConnect();

    const user = await User.findById(id);
    const tracked = user.tracker.tags.find(
      (item) => String(item.itemId) === String(itemId)
    );

    if (!tracked) {
      return NextResponse.json({ error: "Tag not tracked" }, { status: 404 });
    }

    tracked.note = note || "";
    tracked.updatedAt = new Date();
    await user.save();

    return NextResponse.json({ message: "Note updated" }, { status: 200 });
  } catch (err) {
    console.error("PATCH /tracker/tags/[itemId] error:", err);
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

  const { id, itemId } = await context.params;
  if (String(session.user.id) !== String(id)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    await dbConnect();

    const user = await User.findById(id);
    const beforeCount = user.tracker.tags.length;

    user.tracker.tags = user.tracker.tags.filter(
      (item) => String(item.itemId) !== String(itemId)
    );

    const afterCount = user.tracker.tags.length;
    if (beforeCount === afterCount) {
      return NextResponse.json({ error: "Tag not tracked" }, { status: 404 });
    }

    await user.save();
    return NextResponse.json({ message: "Tag untracked" }, { status: 200 });
  } catch (err) {
    console.error("DELETE /tracker/tags/[itemId] error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
