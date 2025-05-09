// /app/api/users/[id]/tracker/politicians/route.js

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { dbConnect } from "@/config/db";
import User from "@/models/User";
import Politician from "@/models/Politician";
import { NextResponse } from "next/server";

// GET: Return list of tracked politicians
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
      .populate({ path: "tracker.politicians.itemId", strictPopulate: false })
      .lean();

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user.tracker.politicians, { status: 200 });
  } catch (err) {
    console.error("GET /tracker/politicians error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST: Track a new politician
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

    const politician = await Politician.findById(itemId);
    if (!politician) {
      return NextResponse.json(
        { error: "Politician not found" },
        { status: 404 }
      );
    }

    const user = await User.findById(id);
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
      note,
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
