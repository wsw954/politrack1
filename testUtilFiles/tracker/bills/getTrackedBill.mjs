//testUtilFiles/tracker/bills/getTrackedBill.mjs

import fetch from "node-fetch";

// Replace with your actual values
const userId = "68193fe0828a4de759ad6d78";
const itemId = "683df4a401f1934b916170b3";
const sessionToken =
  "eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIn0..Vs5tauaAuxRLEGnA.01tka7wip_Yl-zj08BPfVGN5rzOVreXzXYY2KJESS-ZFHmOO8VIR7BztpdQl0CYeRBQaYFkxmlVaMHew66fDGOsfjTj98xnrySeNeaCK1yflIp2m8tQeBwji_Ta4L8sWMDif_3QUPL-kCXDWQaQaDNKBdPP6bJ4HnL4E3svgybjC2gWkF2V21MAUfYsOuqP0LeFsnJGJdoTVhP28GDkXfO7mlzwhUr-TLsTIIJlbARr0rplqGUaHefNBL9cLaISAsqRWbDaasBsncSd0vqYhiw.tkEKxpmwrIzt7am90IQI5A"; // ← Fresh from browser via Notepad

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
