//testUtilFiles/tracker/tags/getAllTrackedPoliticians.mjs
import fetch from "node-fetch";

// Replace with your actual user ID and session token
const userId = "68193fe0828a4de759ad6d78";
const sessionToken =
  "eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIn0..nd7rGt12OD8Yuq1k.CkqEH6tBEw5xJMAn9pzpcIi-YXOJaP2_drDrofXkMXC5ODLsTeNvg_hgPSCapLZrXUhsJ_vaKduZtXkpjG7rLC0n3S89UhIZKDV7QDO715CZiCdaQNlKeCK6Etho61ZlJ9Z-Mi0w0HMh8Q0Bv63kbc3uJl_SN3QVFD9hBraYQSQxjw6KQ6jcRik2C_I8IWtC-nu_RghfarFA0iaom15eWr9v7Xo5aKNQkb-Sh9y2d7dIb8BMFK4Mu_n787zuH8oLYkPku6sPtQzxYqSlNMAwOg.NvE5KwxHC9Sjcyv_IiFJDg";
const url = `http://localhost:3000/api/users/${userId}/tracker/tags`;

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
