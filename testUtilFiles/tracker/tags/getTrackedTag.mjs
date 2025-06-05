//testUtilFiles/tracker/tags/getTrackedTag.mjs

import fetch from "node-fetch";

// Replace with your actual values
const userId = "68193fe0828a4de759ad6d78";
const tagId = "bb14dad3-2df2-405e-a6be-57d25bd2f15e";
const sessionToken =
  "eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIn0..xbzzNwOsQsOBg42e.7iUf1zqqoMR4Pe_InKYj3sEhSkfGK3CjlnI87Vy-yXzJMH__5OdJJUpEXaBg7-IRbOqnJDIPFGyawZKOnLrIX60zYm5luF2s4hilfgo9DztLfQHI--K_b2M61a3ig9Ft-dXAcuBxQIiPJWkxHnzY7YWZR13aHjj3G3166L3OChx2LW_TrxLy9Dd7Pm1nPS2SJsMG2R2kaKvrR4kw7ga6ZBckcQwU80HEZZNm33FHXLEAUAevrNcc2DwNS66vgp3pUGdR1clE130OPS5sEWywLg.-7K4nzC_7cK9JEbjrTvXRA"; // ← Fresh from browser via Notepad

const url = `http://localhost:3000/api/users/${userId}/tracker/tags/${tagId}`;

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
    console.log(`📄 Tracked Tag (${itemId}):\n`);
    console.log(data);
    // console.log(JSON.stringify(data, null, 2));
  } else {
    console.error(`❌ HTTP ${response.status} — ${response.statusText}`);

    if (response.status === 401) {
      console.error("🔒 Unauthorized — Check your session token.");
    } else if (response.status === 403) {
      console.error("🚫 Forbidden — The userId may not match the session.");
    } else if (response.status === 404) {
      console.error("❓ Not Found — Tag may not be tracked.");
    }

    if (data?.error) {
      console.error(`🛑 API Error Message: ${data.error}`);
    }
  }
} catch (err) {
  console.error("💥 Network or server error:", err.message);
}
