// /app/api/users/[id]/tracker/politicians/[itemId]/route.js

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { dbConnect } from "@/config/db";
import User from "@/models/User";
import { NextResponse } from "next/server";

// GET – Fetch a single tracked politician
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
        path: "tracker.politicians.itemId",
        strictPopulate: false,
      })
      .lean();

    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 });

    const tracked = user.tracker.politicians.find(
      (item) => String(item.itemId?._id || item.itemId) === String(itemId)
    );

    if (!tracked) {
      return NextResponse.json(
        { error: "Politician not tracked" },
        { status: 404 }
      );
    }

    return NextResponse.json(tracked, { status: 200 });
  } catch (err) {
    console.error("GET /politicians/[itemId] error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH – Update the note for a tracked politician
export async function PATCH(req, context) {
  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, itemId } = await context.params;
  const { note } = await req.json();

  if (String(session.user.id) !== String(id)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    await dbConnect();

    const user = await User.findById(id);
    const tracked = user.tracker.politicians.find(
      (item) => String(item.itemId) === String(itemId)
    );

    if (!tracked) {
      return NextResponse.json(
        { error: "Politician not tracked" },
        { status: 404 }
      );
    }

    tracked.note = note || "";
    tracked.updatedAt = new Date();
    await user.save();

    return NextResponse.json({ message: "Note updated" }, { status: 200 });
  } catch (err) {
    console.error("PATCH /politicians/[itemId] error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE – Remove a tracked politician
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
    const beforeCount = user.tracker.politicians.length;

    user.tracker.politicians = user.tracker.politicians.filter(
      (item) => String(item.itemId) !== String(itemId)
    );

    const afterCount = user.tracker.politicians.length;
    if (beforeCount === afterCount) {
      return NextResponse.json(
        { error: "Politician not tracked" },
        { status: 404 }
      );
    }

    await user.save();
    return NextResponse.json(
      { message: "Politician untracked" },
      { status: 200 }
    );
  } catch (err) {
    console.error("DELETE /politicians/[itemId] error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
