// /app/api/users/[id]/tracker/bills/[itemId]/route.js

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { dbConnect } from "@/config/db";
import User from "@/models/User";
import Bill from "@/models/Bill";
import Politician from "@/models/Politician";
import Tag from "@/models/Tag";
import { NextResponse } from "next/server";

// GET — Fetch a single tracked bill with full bill populated
export async function GET(req, context) {
  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, itemId } = await context.params;
  if (String(session.user.id) !== String(id))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    await dbConnect();

    // Explicitly define model for tracker.bills.itemId, THEN populate nested
    const user = await User.findById(id)
      .populate({
        path: "tracker.bills.itemId",
        model: "Bill", //THIS LINE makes the difference
        populate: [
          { path: "sponsor", model: "Politician" },
          { path: "co_sponsors", model: "Politician" },
          { path: "tags", model: "Tag" },
        ],
      })
      .lean();

    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 });

    const tracked = user.tracker.bills.find(
      (item) => String(item.itemId?._id || item.itemId) === String(itemId)
    );

    if (!tracked)
      return NextResponse.json({ error: "Bill not tracked" }, { status: 404 });

    return NextResponse.json(
      {
        itemId: tracked.itemId?._id || tracked.itemId,
        itemType: tracked.itemType,
        note: tracked.note,
        createdAt: tracked.createdAt,
        updatedAt: tracked.updatedAt,
        bill: tracked.itemId, // ✅ Fully populated bill document
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("GET /tracker/bills/[itemId] error:", err);
    return NextResponse.json(
      { error: "Internal server error", details: err.message },
      { status: 500 }
    );
  }
}

// PATCH — Update the note for a tracked bill
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
    const tracked = user.tracker.bills.find(
      (item) => String(item.itemId) === String(itemId)
    );

    if (!tracked) {
      return NextResponse.json({ error: "Bill not tracked" }, { status: 404 });
    }

    tracked.note = note || "";
    tracked.updatedAt = new Date();
    await user.save();

    return NextResponse.json({ message: "Note updated" }, { status: 200 });
  } catch (err) {
    console.error("PATCH /bills/[itemId] error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE — Remove a tracked bill
export async function DELETE(req, context) {
  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, itemId } = context.params;
  if (String(session.user.id) !== String(id)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    await dbConnect();

    const user = await User.findById(id);
    const beforeCount = user.tracker.bills.length;

    user.tracker.bills = user.tracker.bills.filter(
      (entry) => String(entry.itemId) !== String(itemId)
    );

    const afterCount = user.tracker.bills.length;
    if (beforeCount === afterCount) {
      return NextResponse.json({ error: "Bill not tracked" }, { status: 404 });
    }

    await user.save();
    return NextResponse.json({ message: "Bill untracked" }, { status: 200 });
  } catch (err) {
    console.error("DELETE /bills/[itemId] error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
