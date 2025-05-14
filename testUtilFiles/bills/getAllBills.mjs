// getAllBills.mjs

import fetch from "node-fetch";

// 🔓 This route is public — no session token required
const url = "http://localhost:3000/api/bills";

// Optional filters — you can add query parameters like ?title=Housing or ?status=In Committee
// const url = "http://localhost:3000/api/bills?status=Passed";
// const url = "http://localhost:3000/api/bills?title=Water";

try {
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const contentType = response.headers.get("content-type");
  const isJson = contentType && contentType.includes("application/json");
  const data = isJson ? await response.json() : null;

  if (response.ok) {
    console.log("📜 All Bills:\n");
    console.log(JSON.stringify(data, null, 2));
  } else {
    console.error(`❌ HTTP ${response.status} — ${response.statusText}`);

    if (data?.error) {
      console.error(`🛑 API Error Message: ${data.error}`);
    }
  }
} catch (err) {
  console.error("💥 Network or server error:", err.message);
}
