//testUtilFile/politicians/deletePolitician.mjs

import fetch from "node-fetch";

// Replace these with valid values
const politicianId = "6843023be195f41ac005b1af"; // e.g., "665e6d1234abc123456789ef"
const adminToken =
  "eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIn0..0fSJRiBmqeCTuzCf.Y9EL3N2UFehVg2H-xV8BxJWisVgDBtyCA1QPijpDHEcGdGKv8KTF8CHmtZPNhkDy1PbVJ7y4gXR0xGXAocQ25sXJt3mTiIJ_8n4S4uh_4I2-mopbIJzD1eRIQ4zo2X90NCLjB81oK2nNGVUElA_HdVDbrUSw3_fSKhzeEUrUb4uEATi5QZzE5kQlhqg_q-Ja9UvSvBJfxdMwhadxpuS0ZbfAq7dutNaID0x1QWIup6fQWuO_LtaOU70_FECT1kW-X69ROoM5oFR89Sn9.uHrcMBfh8n-moZWNInFc-w"; // From logged-in admin session

const url = `http://localhost:3000/api/politicians/${politicianId}`;

try {
  const response = await fetch(url, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${adminToken}`,
    },
  });

  const contentType = response.headers.get("content-type");
  const isJson = contentType && contentType.includes("application/json");
  const data = isJson ? await response.json() : null;

  if (response.ok) {
    console.log("🗑️ Politician successfully deleted:\n");
    console.log(JSON.stringify(data, null, 2));
  } else {
    console.error(`❌ HTTP ${response.status} — ${response.statusText}`);
    if (response.status === 401) {
      console.error("🔒 Unauthorized — Check your admin token.");
    } else if (response.status === 404) {
      console.error("❓ Not Found — Politician ID may be incorrect.");
    }
    if (data?.error) {
      console.error(`🛑 API Error Message: ${data.error}`);
    }
  }
} catch (err) {
  console.error("💥 Network or server error:", err.message);
}
