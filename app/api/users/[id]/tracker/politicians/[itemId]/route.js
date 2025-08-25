// /app/api/users/[id]/tracker/politicians/[itemId]/route.js
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { dbConnect } from "@/config/db";
import User from "@/models/User";
import Politician from "@/models/Politician";
import Bill from "@/models/Bill";
import { NextResponse } from "next/server";

// ✅ GET – Fetch a single tracked politician with full Politician document
export async function GET(req, context) {
  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, itemId } = await context.params; // user id, politician id

  if (String(session.user.id) !== String(id)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    await dbConnect();

    /*   if (!mongoose.isValidObjectId(itemId)) {
      return NextResponse.json(
        { error: "Invalid politician id" },
        { status: 400 }
      );
    } */

    // 1) Find the tracker entry (note, createdAt, etc.)
    const user = await User.findById(id).select("tracker.politicians").lean();

    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 });

    const entry = (user.tracker?.politicians || []).find(
      (p) => String(p.itemId) === String(itemId)
    );
    if (!entry) {
      return NextResponse.json({ error: "Not tracked" }, { status: 404 });
    }

    // 2) Fetch the politician and populate the voting history with bill meta
    const politician = await Politician.findById(itemId)
      .select(
        "first_name last_name party chamber district photo_url contact committee_assignments voting_history consistency_meter updatedAt"
      )
      .populate({
        path: "voting_history.bill_id",
        model: Bill,
        select: "_id title number session",
      })
      .lean();
    console.log("Line 56 in API tracked Pol");
    console.log(politician);
    if (!politician) {
      return NextResponse.json(
        { error: "Politician not found" },
        { status: 404 }
      );
    }

    // 3) Return a consistent shape the page expects
    return NextResponse.json(
      {
        politician, // includes populated voting_history.bill_id
        note: entry.note || "", // tracker note
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
