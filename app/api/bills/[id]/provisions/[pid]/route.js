// app/api/bills/[id]/provisions/[pid]/route.js
import dbConnect from "@/config/db";
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import Bill from "@/models/Bill";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req, context) {
  try {
    await dbConnect();

    const { id, pid } = await context.params; // Next 15: await params

    if (
      !mongoose.Types.ObjectId.isValid(id) ||
      !mongoose.Types.ObjectId.isValid(pid)
    ) {
      return NextResponse.json(
        { message: "Invalid ID format" },
        { status: 400 }
      );
    }

    const url = new URL(req.url);
    const withParam = (url.searchParams.get("with") || "")
      .split(",")
      .map((s) => s.trim());
    const includeLegalText = withParam.includes("legalText");

    // Build aggregation to extract exactly one provision
    const pipeline = [
      { $match: { _id: new mongoose.Types.ObjectId(id) } },
      { $unwind: "$provisions" },
      { $match: { "provisions._id": new mongoose.Types.ObjectId(pid) } },
      {
        $project: {
          _id: "$provisions._id",
          section_number: "$provisions.section_number",
          heading: "$provisions.heading",
          summary: { $ifNull: ["$provisions.summary", ""] },
          why_it_matters: "$provisions.why_it_matters",
          tags: "$provisions.tags",
          type: { $ifNull: ["$provisions.type", "standard"] },
          // Default: DO NOT include legal_text array;
          // instead provide a count for the dropdown label.
          ...(includeLegalText
            ? { legal_text: "$provisions.legal_text" }
            : {
                legalTextCount: {
                  $size: { $ifNull: ["$provisions.legal_text", []] },
                },
              }),
        },
      },
      // Lookup tag names
      {
        $lookup: {
          from: "tags",
          localField: "tags",
          foreignField: "_id",
          as: "_tags",
        },
      },
      {
        $addFields: {
          tags: {
            $map: { input: "$_tags", as: "t", in: "$$t.name" },
          },
        },
      },
      { $project: { _tags: 0 } },
      { $limit: 1 },
    ];

    const [doc] = await Bill.aggregate(pipeline);
    if (!doc) {
      return NextResponse.json(
        { message: "Provision not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(doc, { status: 200 });
  } catch (error) {
    console.error("❌ API ERROR (Get Provision):", error);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}
