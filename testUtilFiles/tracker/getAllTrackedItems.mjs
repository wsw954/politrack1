// /testUtilFiles/getAllTrackedItems.mjs

import fetch from "node-fetch";

// Replace with your real user ID and session token
const userId = "68193fe0828a4de759ad6d78";
const sessionToken =
  "eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIn0..gxkPCupg8eqBgIBo.HsiV_qAlJEJ8v8dzb09xPqP9D7cX1R3whr07cy_6OleXlkSARLJiw1P1CXXZug6LmbR2RgNEZDnFQQ0P9ovfDSAoujeuRTqO4t0nlr6pJkWKWwbvQXhkNoviATsJoP5hcJINe6A-JS3Gh2PkkFVRUdMb8UjeFNryX-eM6XUnyO-aiAz8TZz4-ikk5mnkcBcldGs-KShnNUvL0OLV3E1Seq5rCouvBDYModaplA3vKuRhZ_Ekq9CA6Rpp9xL7NVvZilP0bhDnRUN6GbqCJahcFA.Rxe-IZPh9Bsg6ixoJRsYJA"; // ← Paste fresh from browser via Notepad

const url = `http://localhost:3000/api/users/${userId}/tracker`;

try {
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Cookie: `next-auth.session-token=${sessionToken}`,
    },
  });

  const contentType = response.headers.get("content-type");
  const isJson = contentType && contentType.includes("application/json");

  const data = isJson ? await response.json() : null;

  if (response.ok) {
    console.log("✅ Success — Tracked Items:\n");
    console.log(JSON.stringify(data, null, 2));
  } else {
    console.error(`❌ HTTP ${response.status} — ${response.statusText}`);

    if (response.status === 401) {
      console.error("🔒 Unauthorized — Check your session token.");
    } else if (response.status === 403) {
      console.error("🚫 Forbidden — The userId may not match the session.");
    } else if (response.status === 404) {
      console.error("❓ Not Found — No user found with this ID.");
    }

    if (data?.error) {
      console.error(`🛑 API Error Message: ${data.error}`);
    }
  }
} catch (err) {
  console.error("💥 Network or server error:", err.message);
}
