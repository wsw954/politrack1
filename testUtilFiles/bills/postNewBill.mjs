// testUtilFiles/bills/postNewBill.mjs

import fetch from "node-fetch";

// Replace with your actual values
const adminToken =
  "eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIn0..0fSJRiBmqeCTuzCf.Y9EL3N2UFehVg2H-xV8BxJWisVgDBtyCA1QPijpDHEcGdGKv8KTF8CHmtZPNhkDy1PbVJ7y4gXR0xGXAocQ25sXJt3mTiIJ_8n4S4uh_4I2-mopbIJzD1eRIQ4zo2X90NCLjB81oK2nNGVUElA_HdVDbrUSw3_fSKhzeEUrUb4uEATi5QZzE5kQlhqg_q-Ja9UvSvBJfxdMwhadxpuS0ZbfAq7dutNaID0x1QWIup6fQWuO_LtaOU70_FECT1kW-X69ROoM5oFR89Sn9.uHrcMBfh8n-moZWNInFc-w"; // ← Paste from browser via Notepad

const url = "http://localhost:3000/api/bills";

// Example ObjectIds from your Politician and Tag sample data
const sponsorId = "683df4dd01f1934b916170bf"; // Alicia Martinez
const tagId = "683df1b701f1934b916170ab"; // Housing

const newBill = {
  number: "FL-2025-SB-3001",
  title: "The Big Beautiful Bill",
  type: "General",
  sponsor: sponsorId,
  co_sponsors: [],
  tags: [tagId],
  effective_date: "2025-07-01",
  source_url: "https://www.flsenate.gov/Session/Bill/2025/3001",
  provisions: [
    {
      section_number: "Section 1",
      heading: "State Housing Trust Fund",
      legal_text:
        "The State Housing Trust Fund shall receive $100 million annually...",
      summary: "Allocates recurring funds for affordable housing.",
      why_it_matters: "Supports long-term affordable housing development.",
      tags: [tagId],
      type: "appropriation",
    },
  ],
};

try {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify(newBill),
  });

  const contentType = response.headers.get("content-type");
  const isJson = contentType && contentType.includes("application/json");
  const data = isJson ? await response.json() : null;

  if (response.ok) {
    console.log("✅ Successfully posted new bill:\n");
    console.log(JSON.stringify(data, null, 2));
  } else {
    console.error(`❌ HTTP ${response.status} — ${response.statusText}`);
    if (response.status === 401) {
      console.error("🔒 Unauthorized — Check your session token.");
    } else if (response.status === 400) {
      console.error("⚠️ Bad Request — Missing or invalid bill data.");
    } else if (response.status === 409) {
      console.error("🟨 Conflict — Bill with same number might already exist.");
    }
    if (data?.error) {
      console.error(`🛑 API Error Message: ${data.error}`);
    }
  }
} catch (err) {
  console.error("💥 Network or server error:", err.message);
}
