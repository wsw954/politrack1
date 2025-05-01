// Handle GET/PATCH/DELETE for single item
// /app/api/bills/[id]/route.js
import Bill from "@/models/Bill";
import { dbConnect } from "@/config/db";

export async function GET(req, { params }) {
  try {
    await dbConnect();

    const awaitedParams = await params;
    const { id } = awaitedParams;

    if (!id) {
      return new Response(JSON.stringify({ message: "ID is required" }), {
        status: 400,
      });
    }

    const bill = await Bill.findById(id);

    if (!bill) {
      return new Response(JSON.stringify({ message: "Bill not found" }), {
        status: 404,
      });
    }

    return new Response(JSON.stringify(bill), { status: 200 });
  } catch (error) {
    console.error("❌ API ERROR:", error);
    return new Response(JSON.stringify({ message: "Server Error" }), {
      status: 500,
    });
  }
}
