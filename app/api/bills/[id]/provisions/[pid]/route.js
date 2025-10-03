// app/api/bills/[id]/provisions/[pid]/route.js
import dbConnect from "@/config/db";
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import Bill from "@/models/Bill";

export async function GET(_req, { params }) {
  try {
    await dbConnect();
    const { id, pid } = await params;

    if (
      !mongoose.Types.ObjectId.isValid(id) ||
      !mongoose.Types.ObjectId.isValid(pid)
    ) {
      return NextResponse.json(
        { message: "Invalid ID format" },
        { status: 400 }
      );
    }

    // Pull just the one provision
    const bill = await Bill.findById(id, { provisions: 1 })
      .populate("provisions.tags", "name") // provision-level tags
      .lean();

    if (!bill) {
      return NextResponse.json({ message: "Bill not found" }, { status: 404 });
    }

    const provision = (bill.provisions ?? []).find(
      (p) => String(p._id) === String(pid)
    );

    if (!provision) {
      return NextResponse.json(
        { message: "Provision not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(provision, { status: 200 });
  } catch (error) {
    console.error("❌ API ERROR (Get Provision):", error);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}
