//testUtilFiles/politicians/postNewPolitician.mjs

import fetch from "node-fetch";

// Replace with a valid admin JWT token
const adminToken =
  "eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIn0..0fSJRiBmqeCTuzCf.Y9EL3N2UFehVg2H-xV8BxJWisVgDBtyCA1QPijpDHEcGdGKv8KTF8CHmtZPNhkDy1PbVJ7y4gXR0xGXAocQ25sXJt3mTiIJ_8n4S4uh_4I2-mopbIJzD1eRIQ4zo2X90NCLjB81oK2nNGVUElA_HdVDbrUSw3_fSKhzeEUrUb4uEATi5QZzE5kQlhqg_q-Ja9UvSvBJfxdMwhadxpuS0ZbfAq7dutNaID0x1QWIup6fQWuO_LtaOU70_FECT1kW-X69ROoM5oFR89Sn9.uHrcMBfh8n-moZWNInFc-w"; // Paste from browser/Notepad

const url = "http://localhost:3000/api/politicians";

// 🔧 Create a new politician object matching your schema
const newPolitician = {
  name: "FL-HOUSE-051-CG-2022", // [State-Chamber-District-Initials-Year]
  first_name: "Chicken",
  last_name: "George",
  party: "Republican",
  chamber: "House",
  district: "District 51",
  photo_url: "/app/public/politicians/images/alicia_martinez.jpg",
  contact: {
    email: "chicken.george@myfloridahouse.gov",
    phone: "850-717-5010",
    social_media: {
      X: "@ChickenGeorgeFL",
    },
  },
  committee_assignments: ["Guns", "Tobacco"],
  voting_history: [], // Optional for now
  consistency_meter: {
    party_alignment: 100,
    topic_consistency: {
      Education: 95,
      Housing: 88,
    },
  },
};

try {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify(newPolitician),
  });

  const contentType = response.headers.get("content-type");
  const isJson = contentType && contentType.includes("application/json");
  const data = isJson ? await response.json() : null;

  if (response.ok) {
    console.log("✅ Successfully posted new politician:\n");
    console.log(JSON.stringify(data, null, 2));
  } else {
    console.error(`❌ HTTP ${response.status} — ${response.statusText}`);
    if (response.status === 401) {
      console.error("🔒 Unauthorized — Check your session token.");
    } else if (response.status === 400) {
      console.error("⚠️ Bad Request — Missing or invalid politician data.");
    } else if (response.status === 409) {
      console.error(
        "🟨 Conflict — Politician with same name might already exist."
      );
    }
    if (data?.error) {
      console.error(`🛑 API Error Message: ${data.error}`);
    }
  }
} catch (err) {
  console.error("💥 Network or server error:", err.message);
}
