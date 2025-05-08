// /app/api/users/[id]/bills/[itemId]/route.js
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { dbConnect } from "@/config/db";
import User from "@/models/User";
import { NextResponse } from "next/server";

// GET – Fetch a single tracked bill
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
        path: "tracker.bills.itemId",
        strictPopulate: false,
      })
      .lean();

    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 });

    const trackedBill = user.tracker.bills.find(
      (item) => String(item.itemId?._id || item.itemId) === String(itemId)
    );

    if (!trackedBill) {
      return NextResponse.json({ error: "Bill not tracked" }, { status: 404 });
    }

    return NextResponse.json(trackedBill, { status: 200 });
  } catch (err) {
    console.error("GET /bills/[itemId] error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH – Update the note for a tracked bill
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

// DELETE – Remove a tracked bill
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
    const beforeCount = user.tracker.bills.length;

    user.tracker.bills = user.tracker.bills.filter(
      (item) => String(item.itemId) !== String(itemId)
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
