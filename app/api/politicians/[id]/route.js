// Handle GET/PATCH/DELETE for single item
// /app/api/politicians/[id]/route.js
import Politician from "@/models/Politician";
import { dbConnect } from "@/config/db";

export async function GET(req, { params }) {
  try {
    await dbConnect();

    const awaitedParams = await params;
    const { id } = awaitedParams;

    // Tiny enhancement: Guard clause
    if (!id) {
      return new Response(JSON.stringify({ message: "ID is required" }), {
        status: 400, // Bad Request
      });
    }

    const politician = await Politician.findById(id);

    if (!politician) {
      return new Response(JSON.stringify({ message: "Politician not found" }), {
        status: 404,
      });
    }

    return new Response(JSON.stringify(politician), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ message: "Server Error" }), {
      status: 500,
    });
  }
}
