//app/api/users/[id]/tracker/bills/[itemId]/annotations/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";

import {
  getBillAnnotations as svcGetBillAnn,
  putBillAnnotations as svcPutBillAnn,
  clearBillAnnotations as svcClearBillAnn,
} from "@/lib/services/tracker";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET  /api/users/:id/tracker/bills/:itemId/annotations
 * Returns the user's annotations for that tracked bill.
 */
export async function GET(req, context) {
  try {
    const session = await getServerSession(authOptions);
    if (!session)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { id: userId, itemId } = await context.params; // Next 15: await params
    if (String(session.user.id) !== String(userId)) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const data = await svcGetBillAnn({ userId, billId: itemId });
    if (!data) {
      return NextResponse.json(
        { message: "Tracked bill not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    console.error("GET bill annotations error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

/**
 * PUT  /api/users/:id/tracker/bills/:itemId/annotations
 * Replaces (upserts) the annotations object for that tracked bill.
 * This operation is idempotent.
 */
export async function PUT(req, context) {
  try {
    const session = await getServerSession(authOptions);
    if (!session)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { id: userId, itemId } = await context.params;
    if (String(session.user.id) !== String(userId)) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const result = await svcPutBillAnn({
      userId,
      billId: itemId,
      payload: body,
    });

    if (!result.ok) {
      return NextResponse.json(
        { message: result.message },
        { status: result.status || 400 }
      );
    }

    // Optionally surface validation warnings (e.g., bad URLs filtered out)
    return NextResponse.json(
      {
        message: "Annotations saved",
        annotations: result.annotations,
        warnings: result.warnings || [],
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("PUT bill annotations error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

/**
 * DELETE  /api/users/:id/tracker/bills/:itemId/annotations
 * Clears the annotations (resets to empty values) for that tracked bill.
 */
export async function DELETE(req, context) {
  try {
    const session = await getServerSession(authOptions);
    if (!session)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { id: userId, itemId } = await context.params;
    if (String(session.user.id) !== String(userId)) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const result = await svcClearBillAnn({ userId, billId: itemId });
    if (!result.ok) {
      return NextResponse.json(
        { message: result.message },
        { status: result.status || 400 }
      );
    }

    return NextResponse.json(
      {
        message: "Annotations cleared",
        annotations: {
          generalNotes: "",
          links: [],
          attachments: [],
          labels: [],
        },
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("DELETE bill annotations error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
