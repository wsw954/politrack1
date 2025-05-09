// /testUtilFiles/tracker/deleteTrackedPolitician.mjs

import fetch from "node-fetch";

// Replace with your actual values
const userId = "68193fe0828a4de759ad6d79";
const itemId = "FL-HOUSE-001";
const sessionToken =
  "eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIn0..YM9GUJInHqi7mti8.zIwO3OpMs7pvDb0auAZLHEQWzne8XyteJDqi-nlxV-kkumZPvQBtJzu_MhqMFp--FZWjD6bpOvGaeFqyaD7VphdMjiEsMAwwrZRses_WKVyguKtWdeD-SNhvaxx1gZPSaAMAseAiNMyqJCiKRT34_OYrCSINeXBXoAevv9V0qevEmi1VmZhXnvL7UApEgQ7QYqS1gdENrHjF1R4l6V7iEsHV2gRjhg2jDDE_S3f42u8nXQlysn_s4SjVdH1tkgG_wHkqDIlLhGSrhTFLlDhuIfbNW-c.L4_IFFQRqw3pKaGpaaxhjA"; // ← From browser → Notepad

const url = `http://localhost:3000/api/users/${userId}/tracker/politicians/${itemId}`;

try {
  const response = await fetch(url, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Cookie: `next-auth.session-token=${sessionToken}`,
    },
  });

  const contentType = response.headers.get("content-type");
  const isJson = contentType && contentType.includes("application/json");
  const data = isJson ? await response.json() : null;

  if (response.ok) {
    console.log(`🗑️ Successfully untracked politician "${itemId}":\n`);
    console.log(JSON.stringify(data, null, 2));
  } else {
    console.error(`❌ HTTP ${response.status} — ${response.statusText}`);

    if (response.status === 401) {
      console.error("🔒 Unauthorized — Check your session token.");
    } else if (response.status === 403) {
      console.error("🚫 Forbidden — The userId may not match the session.");
    } else if (response.status === 404) {
      console.error("❓ Not Found — This politician may not be tracked.");
    }

    if (data?.error) {
      console.error(`🛑 API Error Message: ${data.error}`);
    }
  }
} catch (err) {
  console.error("💥 Network or server error:", err.message);
}
