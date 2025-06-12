//testUtilFiles/politicians/postNewPolitician.mjs

import fetch from "node-fetch";

// Replace with a valid admin JWT token
const adminToken =
  "eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIn0..jJ6uGI2U7Ww0SsgK.FhUrW_3FE39Tl5bdmNS10xOZsVeHSX10_XszM-1nI4cX--tHOa1axHQZDC1FSt9UXn-4LSqu1vGYHxZJkPKs3KEefF86Id-9orBVY9yqqrcTXW0J52kHQXVya4lNUJUjCkZhtBhR3KkG-a_EtnKNFBZoX5Z4WLrv_hqt0Ama4KqV13ciydTZe-wdZAPC13V7PvPvt9hz-KWn4MXJehXcjUS6-8bXLhyUMy1JGkeWsBXFRTSLfXpjrUxHzkvYzgXcaS9YFDuixCW5JCMr.QLN4cB_gRl1WJKtRutN7xw"; // Paste from browser/Notepad

const url = "http://localhost:3000/api/politicians";

// 🔧 Create a new politician object matching your schema
const newPolitician = {
  name: "FL-HOUSE-051-CG-2022", // [State-Chamber-District-Initials-Year]
  first_name: "Chicken",
  last_name: "George",
  party: "Republican",
  chamber: "House",
  district: "District 51",
  photo_url: "/app/public/politicians/images/default.jpg",
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
