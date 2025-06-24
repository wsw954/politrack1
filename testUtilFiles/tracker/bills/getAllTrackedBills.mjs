// testUtilFiles/getAllTrackedBills.mjs

import fetch from "node-fetch";

// Replace with your actual user ID and session token
const userId = "68193fe0828a4de759ad6d78";
const sessionToken =
  "eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIn0..CfRiBFRsXRvMPX_O.PgjY3zJ53WbyquIlvKVipK-tbFZJ2O50jntcq12zWpLibPBYJstw79sBQxcYqSb8PXMIqHLiuEfo83QpKGzTVFYXzA37i_E8nqvk4PytYvTZAgGRelFBFWa83L-q5nb4r4nOvuGovw4UfHwUmG1_sMnw7KCpe7Kk2YSRZnofuasc-OmrGG5JDy_0j0yU_-iTm_EGtWC6G2kE3SN0fSXUZq_lLRDVto1wbioElKK_Gqnq9-swU9Bh6bO0IZtcYm8FPRpgnyHlE0biCfB2TukX8A.Sq17JJo37zaTlr35Z0gpPw"; // ← From browser → Notepad → Here

const url = `http://localhost:3000/api/users/${userId}/tracker/bills`;

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
    console.log("📋 Tracked Bills:\n");
    console.log(JSON.stringify(data, null, 2));
  } else {
    console.error(`❌ HTTP ${response.status} — ${response.statusText}`);

    if (response.status === 401) {
      console.error("🔒 Unauthorized — Check your session token.");
    } else if (response.status === 403) {
      console.error("🚫 Forbidden — The userId may not match the session.");
    } else if (response.status === 404) {
      console.error("❓ Not Found — No tracked bills.");
    }

    if (data?.error) {
      console.error(`🛑 API Error Message: ${data.error}`);
    }
  }
} catch (err) {
  console.error("💥 Network or server error:", err.message);
}
