// testUtilFiles/patchTrackedBill.mjs

import fetch from "node-fetch";

// Replace with your actual values
const userId = "68193fe0828a4de759ad6d78";
const itemId = "683df4a401f1934b916170b3";
const sessionToken =
  "eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIn0..tFkWFYyE1qGLjJpX.4h43poCkHKd6fu8deeZpQ0P7LWy4rRqz_8totMxAcykj15vNAFS2z3EVu4B1mvuFNZyNvqbmTl6Y9PcyDy0h3LI0F0qy-Jypsv-XxGc-cvL7_-xy1gQmkYIZeKh8bbKBLFsdd9XlR02RfZyqqwN5ZD0f0P68wS2_LyFyO5pGtOsvd48nRrQ7gp8LIvqofwPjBLyfYBfFANkxvnyXDhau0nxjtU5dyPcoWwe0SrU1ONfF_ytqcvUa0HoI4E32ZdZvRRUwJsZze_IleoHVlcdStg.v6qNSb41DznRu4hNzY8yPQ"; // ← Paste clean token from browser

const url = `http://localhost:3000/api/users/${userId}/tracker/bills/${itemId}`;

const updatedNote = {
  note: "School Board Tax Issues",
};

try {
  const response = await fetch(url, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Cookie: `next-auth.session-token=${sessionToken}`,
    },
    body: JSON.stringify(updatedNote),
  });

  const contentType = response.headers.get("content-type");
  const isJson = contentType && contentType.includes("application/json");
  const data = isJson ? await response.json() : null;

  if (response.ok) {
    console.log(`✏️ Successfully updated note for ${itemId}:\n`);
    console.log(JSON.stringify(data, null, 2));
  } else {
    console.error(`❌ HTTP ${response.status} — ${response.statusText}`);

    if (response.status === 401) {
      console.error("🔒 Unauthorized — Check your session token.");
    } else if (response.status === 403) {
      console.error("🚫 Forbidden — The userId may not match the session.");
    } else if (response.status === 404) {
      console.error("❓ Not Found — This bill may not be tracked.");
    }

    if (data?.error) {
      console.error(`🛑 API Error Message: ${data.error}`);
    }
  }
} catch (err) {
  console.error("💥 Network or server error:", err.message);
}
