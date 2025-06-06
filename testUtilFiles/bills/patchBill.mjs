//testUtilFiles/bills/patchBill.mjs

import fetch from "node-fetch";

// Replace with actual values before running
const billId = "6842f11fe195f41ac005b190"; // e.g., "665e61c8abc123456789abcd"
const adminToken =
  "eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIn0..0fSJRiBmqeCTuzCf.Y9EL3N2UFehVg2H-xV8BxJWisVgDBtyCA1QPijpDHEcGdGKv8KTF8CHmtZPNhkDy1PbVJ7y4gXR0xGXAocQ25sXJt3mTiIJ_8n4S4uh_4I2-mopbIJzD1eRIQ4zo2X90NCLjB81oK2nNGVUElA_HdVDbrUSw3_fSKhzeEUrUb4uEATi5QZzE5kQlhqg_q-Ja9UvSvBJfxdMwhadxpuS0ZbfAq7dutNaID0x1QWIup6fQWuO_LtaOU70_FECT1kW-X69ROoM5oFR89Sn9.uHrcMBfh8n-moZWNInFc-w"; // From logged-in admin session

const url = `http://localhost:3000/api/bills/${billId}`;

// 🛠️ Specify only the fields you want to update
const updates = {
  title: "The Big Beautiful Bill-SB edition",
  summary: "This summary has been revised to reflect recent amendments.",
  status: {
    current_stage: "Committee",
    timeline: [
      {
        stage: "Introduced",
        date: "2025-03-01",
      },
      {
        stage: "Committee",
        date: "2025-04-01",
      },
    ],
  }, // Example: assuming this is a valid enum/status value in your schema
};

try {
  const response = await fetch(url, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify(updates),
  });

  const contentType = response.headers.get("content-type");
  const isJson = contentType && contentType.includes("application/json");
  const data = isJson ? await response.json() : null;

  if (response.ok) {
    console.log("✅ Bill successfully updated:\n");
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
