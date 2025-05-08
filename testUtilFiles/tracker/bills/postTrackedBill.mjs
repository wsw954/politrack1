// tracker-postTrackedBill.mjs

import fetch from "node-fetch";

// Replace with your actual values
const userId = "68193fe0828a4de759ad6d79";
const sessionToken =
  "eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIn0..od4pPVIspQD4r6i6.4XjKmhn9aIB1lbPW2niW_Akjz3TuPSSs5Aogs5k425ozqcohr_4JkRNkpnv4vbVpaygslOa0rcoudbsHilnsHFXsnmCGDlUanOm6Tl4VGZdknUpQ0MP7w4fgCZzkyD6KvSUK-2UvESscCzXv9iw7fcbQfCwPfAv8TlN_K5wiV-zjafonX-YGoUnCT7GXpNM48ydf83NcaWKZW7hpDmSnu6BsxOkrvrV44xOEy6EsyLWnW9EprogSlLduyjWvAQmSuKbRhIjMaq4j0mo-BfE3iTo1ENY.giXN8o7AX482VJkPnWJWzQ"; // ← Paste from browser via Notepad

const url = `http://localhost:3000/api/users/${userId}/tracker/bills`;

const newTrackedBill = {
  itemId: "FL-2025-HB-1001f",
  itemType: "Bill",
  note: "Vote stalled",
  createdAt: "2025-05-06T10:00:00.000Z",
  updatedAt: "2025-05-06T10:00:00.000Z",
};

try {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: `next-auth.session-token=${sessionToken}`,
    },
    body: JSON.stringify(newTrackedBill),
  });

  const contentType = response.headers.get("content-type");
  const isJson = contentType && contentType.includes("application/json");
  const data = isJson ? await response.json() : null;

  if (response.ok) {
    console.log("✅ Successfully added tracked bill:\n");
    console.log(JSON.stringify(data, null, 2));
  } else {
    console.error(`❌ HTTP ${response.status} — ${response.statusText}`);

    if (response.status === 401) {
      console.error("🔒 Unauthorized — Check your session token.");
    } else if (response.status === 403) {
      console.error("🚫 Forbidden — The userId may not match the session.");
    } else if (response.status === 409) {
      console.error("⚠️ Conflict — This bill may already be tracked.");
    }

    if (data?.error) {
      console.error(`🛑 API Error Message: ${data.error}`);
    }
  }
} catch (err) {
  console.error("💥 Network or server error:", err.message);
}
