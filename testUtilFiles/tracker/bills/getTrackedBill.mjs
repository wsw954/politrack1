//testUtilFiles/getTrackedBill.mjs

import fetch from "node-fetch";

// Replace with your actual values
const userId = "68193fe0828a4de759ad6d79";
const itemId = "FL-2025-HB-1005";
const sessionToken =
  "eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIn0..0TO7iiIipHwzN9x2.cWbgEy6krjoYQpW9-VTUnxpSM0sfVNK1OrI7yw3G4fFpmnvaL_zTeH-4b6PTVHbXUdlAE7elxtcodl6BsU7t4Hen-b-ldbp6pcVJRE7gVyzZPY6iSGUeBVXetLQot2QPtva3--8jErxOGsxjeiXnmQgMj9dnvwuf9GlEUCrSx-pi8wVLkAA-fXIFcTbp09YI5-q9W3klkNfRvRaOnxlS8KeCDY0P7rgRNVMOBdfn92_sYuOM0zZYj50W54KLT-vGFMit6-fxXCxB7AJobgOrOssFRh8.UBjGxEO8gP5jOREzI5ghGQ"; // ← Fresh from browser via Notepad

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
    console.log(data);
    // console.log(JSON.stringify(data, null, 2));
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
