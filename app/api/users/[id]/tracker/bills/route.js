// app/api/users/[id]/tracker/bills/route.js
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { dbConnect } from "@/config/db";
import User from "@/models/User";
import Bill from "@/models/Bill";
import { NextResponse } from "next/server";

// GET: Return list of tracked bills
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
      .populate({ path: "tracker.bills.itemId", strictPopulate: false })
      .lean();

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user.tracker.bills, { status: 200 });
  } catch (err) {
    console.error("GET /tracker/bills error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST: Track a new bill
export async function POST(req, context) {
  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await context.params;
  if (String(session.user.id) !== String(id)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { itemId, note = "" } = await req.json();
  if (!itemId) {
    return NextResponse.json({ error: "Missing itemId" }, { status: 400 });
  }

  try {
    await dbConnect();

    const bill = await Bill.findById(itemId);
    if (!bill) {
      return NextResponse.json({ error: "Bill not found" }, { status: 404 });
    }

    const user = await User.findById(id);
    const alreadyTracked = user.tracker.bills.some(
      (entry) => String(entry.itemId) === String(itemId)
    );

    if (alreadyTracked) {
      return NextResponse.json(
        { error: "Bill already tracked" },
        { status: 400 }
      );
    }

    user.tracker.bills.push({
      itemId,
      itemType: "Bill",
      note,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await user.save();

    return NextResponse.json({ message: "Bill tracked" }, { status: 201 });
  } catch (err) {
    console.error("POST /tracker/bills error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
