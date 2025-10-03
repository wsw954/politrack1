//app/api/bills/[id]/provisions/route.js
import { dbConnect } from "@/config/db";
import Bill from "@/models/Bill";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  try {
    await dbConnect();
    const { id } = await params;

    const bill = await Bill.findById(id, {
      "provisions._id": 1,
      "provisions.section_number": 1,
      "provisions.heading": 1, // optional but useful for lists
      "provisions.summary": 1,
      "provisions.why_it_matters": 1,
      "provisions.tags": 1,
      "provisions.type": 1,
      "provisions.legal_text._id": 1, // tiny; lets us count without big text
    }) // populate provision-level tags to show names in the list
      .populate({ path: "provisions.tags", select: "name" })
      .lean();

    if (!bill) {
      return NextResponse.json({ message: "Bill not found" }, { status: 404 });
    }
    const provisions = (bill.provisions ?? []).map((p) => ({
      _id: p._id,
      section_number: p.section_number,
      heading: p.heading, // remove if you truly only want section_number/summary/type/tags
      summary: p.summary ?? "",
      why_it_matters: p.why_it_matters,
      tags: Array.isArray(p.tags) ? p.tags.map((t) => t?.name ?? t) : [],
      type: p.type ?? "standard",
      legalTextCount: Array.isArray(p.legal_text) ? p.legal_text.length : 0,
    }));

    return NextResponse.json(provisions, { status: 200 });
  } catch (error) {
    console.error("❌ API ERROR:", error);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}

// export async function POST(req, { params }) {
//   await db();
//   const provision = await req.json(); // {section_number, heading, legal_text:[], ...}
//   const res = await Bill.updateOne(
//     { _id: params.billId },
//     { $push: { provisions: provision } }
//   );
//   return NextResponse.json(
//     { matched: res.matchedCount, modified: res.modifiedCount },
//     { status: 201 }
//   );
// }
