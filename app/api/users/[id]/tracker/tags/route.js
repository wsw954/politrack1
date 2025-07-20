//app/api/users/[id]/tracker/tags/route.js
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { dbConnect } from "@/config/db";
import User from "@/models/User";
import Tag from "@/models/Tag";
import { NextResponse } from "next/server";

// GET: Return list of tracked tags
export async function GET(req, context) {
  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await context.params;
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

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user.tracker.tags, { status: 200 });
  } catch (err) {
    console.error("GET /tracker/tags error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST: Track a new tag
export async function POST(req, context) {
  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await context.params;
  if (String(session.user.id) !== String(id)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { itemId, itemType, note = "" } = await req.json();
  if (!itemId) {
    return NextResponse.json({ error: "Missing itemId" }, { status: 400 });
  }

  try {
    await dbConnect();

    const tag = await Tag.findById(itemId);
    if (!tag) {
      return NextResponse.json({ error: "Tag not found" }, { status: 404 });
    }

    const user = await User.findById(id);
    const alreadyTracked = user.tracker.tags.some(
      (entry) => String(entry.itemId) === String(itemId)
    );

    if (alreadyTracked) {
      return NextResponse.json(
        { error: "Tag already tracked" },
        { status: 400 }
      );
    }

    user.tracker.tags.push({
      itemId,
      itemType,
      note,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await user.save();

    return NextResponse.json({ message: "Tag tracked" }, { status: 201 });
  } catch (err) {
    console.error("POST /tracker/tags error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
