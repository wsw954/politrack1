//testUtilFiles/tracker/politicians/getAllTrackedPoliticians.mjs
import fetch from "node-fetch";

// Replace with your actual user ID and session token
const userId = "68193fe0828a4de759ad6d78";
const sessionToken =
  "eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIn0..vHF8QuwA6O_0nsYo.rYSILfGhH8GgI5MAC8D-Ogygyl54k1F-YBTCrDCGTf5cuJ2tOud1Ge9_ftdw0Tx8FHzz1YvXPr0WyGv3EEEh4vUjM5UIuQnvkYqZIOmjDX_lINT4bOMdYWnU2qvvCQD43R4wYpHNbLkrCYsh9L7e91bBc46JuBXRPmtoCJz8Ph5xLhByNj79NICi5oYQMd-JZJBTiOA5oO06Et5EGic86_zFF-WZzaWqmKhu5HQmCmCk-mmHlDlC4_lFFcRtobphBc7IxRaVmEWmMHTmd3gyrw.RRHYuxj6rLr7dDRkbX3oFg";

const url = `http://localhost:3000/api/users/${userId}/tracker/politicians`;

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
    console.log("📋 Tracked Politicians:\n");
    console.log(JSON.stringify(data, null, 2));
  } else {
    console.error(`❌ HTTP ${response.status} — ${response.statusText}`);
    if (response.status === 401) {
      console.error("🔒 Unauthorized — Check your session token.");
    } else if (response.status === 403) {
      console.error("🚫 Forbidden — The userId may not match the session.");
    } else if (response.status === 404) {
      console.error("❓ Not Found — No tracked politicians.");
    }
    if (data?.error) {
      console.error(`🛑 API Error Message: ${data.error}`);
    }
  }
} catch (err) {
  console.error("💥 Network or server error:", err.message);
}
