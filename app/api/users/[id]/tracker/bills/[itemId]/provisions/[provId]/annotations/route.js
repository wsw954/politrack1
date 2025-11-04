// /app/api/users/[id]/tracker/bills/[itemId]/provisions/[provId]/annotations/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";

import {
  getProvisionAnnotations as svcGetProvAnn,
  putProvisionAnnotations as svcPutProvAnn,
  clearProvisionAnnotations as svcClearProvAnn,
} from "@/lib/services/tracker";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET  /api/users/:id/tracker/bills/:itemId/provisions/:provId/annotations
 * Returns annotations for a specific provision of a tracked bill.
 */
export async function GET(_req, context) {
  try {
    const session = await getServerSession(authOptions);
    if (!session)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { id: userId, itemId, provId } = await context.params; // Next 15: await params
    if (String(session.user.id) !== String(userId)) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const data = await svcGetProvAnn({ userId, billId: itemId, provId });
    if (!data) {
      return NextResponse.json(
        { message: "Tracked bill not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    console.error("GET provision annotations error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

/**
 * PUT  /api/users/:id/tracker/bills/:itemId/provisions/:provId/annotations
 * Replaces (upserts) annotations for a provision (idempotent).
 */
export async function PUT(req, context) {
  try {
    const session = await getServerSession(authOptions);
    if (!session)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { id: userId, itemId, provId } = await context.params;
    if (String(session.user.id) !== String(userId)) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const result = await svcPutProvAnn({
      userId,
      billId: itemId,
      provId,
      payload: body,
    });

    if (!result.ok) {
      return NextResponse.json(
        { message: result.message },
        { status: result.status || 400 }
      );
    }

    return NextResponse.json(
      {
        message: "Provision annotations saved",
        annotations: result.annotations,
        warnings: result.warnings || [],
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("PUT provision annotations error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

/**
 * DELETE  /api/users/:id/tracker/bills/:itemId/provisions/:provId/annotations
 * Removes annotations for a specific provision.
 */
export async function DELETE(_req, context) {
  try {
    const session = await getServerSession(authOptions);
    if (!session)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { id: userId, itemId, provId } = await context.params;
    if (String(session.user.id) !== String(userId)) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const result = await svcClearProvAnn({ userId, billId: itemId, provId });
    if (!result.ok) {
      return NextResponse.json(
        { message: result.message },
        { status: result.status || 400 }
      );
    }

    return NextResponse.json(
      { message: "Provision annotations cleared" },
      { status: 200 }
    );
  } catch (err) {
    console.error("DELETE provision annotations error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
