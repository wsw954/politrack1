//testUtilFiles/getTrackedBill.mjs

import fetch from "node-fetch";

// Replace with your actual values
const userId = "68193fe0828a4de759ad6d78";
const itemId = "FL-2025-HB-1001";
const sessionToken =
  "eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIn0..OByjQCxROf52tUdh.gBvU0_0Woiv16xK5SBOETn3mCpRDJ4PRsCAv1ufDQwysVXs2ohMOczoWcANdtIbuFpHrqfydMBTAp-ymCN-UYnaDCzlc5j9J1BaD5F1GZZWglrYmdwgx61c3bsRYxZX9F99cFA93kdYmv36tbVT0HBAgnPB9tmWE5ALjiIW7Y2XAJHGz7NbM-9A5QWUe9MuYOugdzSO1rOT-GJZYkG-E4kS6iYLJhfzuZoKMn-J3yeXw5SR0O5aW9cSwEDjLC8NjtyxswZ9u2uqSaOuoNnLL0twuIdI.E6wyAkO0Uuxy_68Wugnp3g"; // ← Fresh from browser via Notepad

const url = `http://localhost:3000/api/users/${userId}/tracker/bills/${itemId}`;

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
    console.log(`📄 Tracked Bill (${itemId}):\n`);
    console.log(JSON.stringify(data, null, 2));
  } else {
    console.error(`❌ HTTP ${response.status} — ${response.statusText}`);

    if (response.status === 401) {
      console.error("🔒 Unauthorized — Check your session token.");
    } else if (response.status === 403) {
      console.error("🚫 Forbidden — The userId may not match the session.");
    } else if (response.status === 404) {
      console.error("❓ Not Found — Bill may not be tracked.");
    }

    if (data?.error) {
      console.error(`🛑 API Error Message: ${data.error}`);
    }
  }
} catch (err) {
  console.error("💥 Network or server error:", err.message);
}
