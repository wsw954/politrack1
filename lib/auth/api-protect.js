// /lib/auth/api-protect.js
import { getServerSession } from "next-auth";
import { getToken } from "next-auth/jwt";
import { authOptions } from "@/lib/auth/options";

const secret = process.env.NEXTAUTH_SECRET;

export async function requireAdmin(req) {
  // Try browser-side session first
  const session = await getServerSession(authOptions);

  if (!session) {
    // Fallback to Bearer token or Cookie (JWT session)
    const token = await getToken({ req, secret });
    if (!token || token.role !== "admin") {
      throw new Error("Unauthorized");
    }
    return { user: token }; // Emulate session
  }

  if (session.user.role !== "admin") {
    throw new Error("Unauthorized");
  }

  return session;
}
