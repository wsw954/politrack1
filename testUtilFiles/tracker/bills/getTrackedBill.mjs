//testUtilFiles/tracker/bills/getTrackedBill.mjs

import fetch from "node-fetch";

// Replace with your actual values
const userId = "68193fe0828a4de759ad6d78";
const itemId = "683df4a401f1934b916170b3";
const sessionToken =
  "eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIn0..4beJcy7mA2_WQ5oS.gapraayppJ96v9vULiGd_scywkSziBse2vysrr4EXgY3wVSfHlBs7VtS35eMBHAUmZ5YCdmGMJn0YrjyqlIIJ6vq7Jtyu44w3yCjOG9xCQEMSfYqsvFr4MmOHu8F3B9eBp3oSJohW7IsrGHXWBmLe0u2ePAFeUnBKpEcdIwljOXQ_0c3BJVPqP4TxDSuAOfJ3Tydllw4KsH16ajtSDxw3tmSFGN8qQfNLG7ef7J3ppWqgf6HfSFfC8qtEp0OR0gcWSGmRcqVBoNJhCxsRSgu7Q.N1bKTtt5paidJblrgbFqpQ"; // ← Fresh from browser via Notepad

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
