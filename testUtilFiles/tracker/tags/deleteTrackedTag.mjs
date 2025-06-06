// testUtilFiles/tracker/tags/deleteTrackedTag.mjs

import fetch from "node-fetch";

// Replace with your real user ID and session token
const userId = "68193fe0828a4de759ad6d78";
const tagId = "683e25c7c3bc9f419dffa464";
const sessionToken =
  "eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIn0..q0Cwsj4B3PImxqjp.kkqiYmHJFWgdSglv5AUGD8bcwskMERn7tjL7jISHyE5TkH0vpm660aM78cgXl3FJoi7VKGai4gjSLV9cFCRFW1XdDiJBjHcFdfsxhQVYtedUa6gGhFD9syz48NhJ0qzeB3d2IZxgfNcV5XIaYH3UrDz_l3o2qfYK0WCLqxkxt-5WmadFY7ECaNwGpBjx0t6Ieay8ExPH9L7ULKGIMljY7kDDw6d7x0bK4sCdAeWxuDs3pP7_wl_c7k0KSNMR1XgoMR2kKUvKFMxnT7FXZybC-A.2cJDYtkTqxwVS073fcbH7Q"; // ← Paste from DevTools via Notepad

const url = `http://localhost:3000/api/users/${userId}/tracker/tags/${tagId}`;

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
    console.log(`🗑️ Successfully untracked tag "${tagId}":\n`);
    console.log(JSON.stringify(data, null, 2));
  } else {
    console.error(`❌ HTTP ${response.status} — ${response.statusText}`);

    if (response.status === 401) {
      console.error("🔒 Unauthorized — Check your session token.");
    } else if (response.status === 403) {
      console.error("🚫 Forbidden — The userId may not match the session.");
    } else if (response.status === 404) {
      console.error("❓ Not Found — This tag is not tracked or doesn't exist.");
    }

    if (data?.error) {
      console.error(`🛑 API Error Message: ${data.error}`);
    }
  }
} catch (err) {
  console.error("💥 Network or server error:", err.message);
}
