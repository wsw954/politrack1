//testUtilFiles/politicians/getPoliticianById.mjs

import fetch from "node-fetch";

// Replace with a real Politician document _id from your DB
const politicianId = "6843023be195f41ac005b1af"; // e.g., "665e6d1234abc123456789ef"

const url = `http://localhost:3000/api/politicians/${politicianId}`;

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
    console.log("📌 Politician fetched by ID:\n");
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
