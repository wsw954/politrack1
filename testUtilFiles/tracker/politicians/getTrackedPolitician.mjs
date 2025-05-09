//  app/testUtilFiles/tracker/politicians/getTrackedPolitician.mjs

import fetch from "node-fetch";

// Replace with your actual values
const userId = "68193fe0828a4de759ad6d79";
const itemId = "FL-SENATE-002";
const sessionToken =
  "eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIn0..lgM1DuyHdMX-Pmb5.Tu0YXDX-XczmUGBp44VZQGEcXgl4vYwgfcGe1EPz9a5UjfvIQUJwzg9-Vx9bleq0qssm18HRcRZSnnybHLlsupbi1vj_peIFHqid3aF4k6HzQR4d7wWr10rAIa_FPWt9e7g2kIyxLWeJ2o5uAZAdkH5a_WGCXlhIXf-2HWnDWIpct-5KCvyX8Ed4b8mCsB592VZ6iJj4va5bQRo97IdPVIwHWcHdUN7qPY3_-i-MBSI4Bz5dkYpmPET3HEo13b7Yz_poHtO2D8VyXnXOIkgLc3yy62A.t37D1gIF-SiL02yxrMkxlw"; // ← From browser → Notepad → here

const url = `http://localhost:3000/api/users/${userId}/tracker/politicians/${itemId}`;

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
    console.log(`📄 Tracked Politician (${itemId}):\n`);
    console.log(JSON.stringify(data, null, 2));
  } else {
    console.error(`❌ HTTP ${response.status} — ${response.statusText}`);

    if (response.status === 401) {
      console.error("🔒 Unauthorized — Check your session token.");
    } else if (response.status === 403) {
      console.error("🚫 Forbidden — The userId may not match the session.");
    } else if (response.status === 404) {
      console.error("❓ Not Found — This politician is not tracked.");
    }

    if (data?.error) {
      console.error(`🛑 API Error Message: ${data.error}`);
    }
  }
} catch (err) {
  console.error("💥 Network or server error:", err.message);
}
