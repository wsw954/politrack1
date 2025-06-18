// testUtilFiles/getAllTrackedBills.mjs

import fetch from "node-fetch";

// Replace with your actual user ID and session token
const userId = "68193fe0828a4de759ad6d78";
const sessionToken =
  "eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIn0..1e0yfahGQOhF-sQi.GaAD284Bn5tUfEA7xC8v5ZEj1AcHKEwKihoC7Pg_dzKlDuhpfqnDkRV_0unxs2cOphTAzI53EDfHTDdbOeBG9UVJ1DU2SY1uv1JpNHQD5u9HQPMd49kyjfgLCQ8Slk-OxoVHtjXHh-VlXOZWvmRuhBZM38HBetwWh7SK38PAS_Cfgx4N_RWK2fVoe402sGQplRDJUOZbVC1xSncJevKLrrdp0BQmtWZNo5gB79gJ15p-2-N_4G4n9ys6ez11ZJxrUnWZqcGVzyowsKD4jMonLA.VkMLuT1ftuwbh7hfAEvhiQ"; // ← From browser → Notepad → Here

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
