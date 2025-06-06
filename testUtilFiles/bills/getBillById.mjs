// testUtilFiles/bills/getBillById.mjs

import fetch from "node-fetch";

// Replace with a valid _id from your MongoDB Bills collection
const billId = "6842f11fe195f41ac005b190"; // or use the actual _id if it's an ObjectId

const url = `http://localhost:3000/api/bills/${billId}`;

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
    console.log("📋 Bill Details:\n");
    console.log(JSON.stringify(data, null, 2));
  } else {
    console.error(`❌ HTTP ${response.status} — ${response.statusText}`);

    if (response.status === 404) {
      console.error("❓ Not Found — No bill with that ID.");
    }

    if (data?.error) {
      console.error(`🛑 API Error Message: ${data.error}`);
    }
  }
} catch (err) {
  console.error("💥 Network or server error:", err.message);
}
