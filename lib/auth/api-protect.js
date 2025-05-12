// /lib/auth/api-protect.js
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";

/**
 * Returns session if user is admin; else throws error
 */
export async function requireAdmin(request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    throw new Error("Unauthorized");
  }
  return session;
}
