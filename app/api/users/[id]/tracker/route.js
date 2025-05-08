// /app/api/users/[id]/tracker/route.js
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { dbConnect } from "@/config/db";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function GET(req, context) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const params = await context.params;
  const { id } = params;

  console.log("🔍 session.user.id:", session.user.id);
  console.log("🔍 params.id:", id);
  console.log(session);
  if (String(session.user.id) !== String(id)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    await dbConnect();

    const user = await User.findById(id)
      .populate("tracker.politicians.itemId")
      .populate("tracker.bills.itemId")
      .lean();

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { tracker } = user;
    return NextResponse.json(tracker, { status: 200 });
  } catch (err) {
    console.error("Tracker API error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
