// updateTag.mjs
import fetch from "node-fetch";

// Replace with your actual tag ID and a valid admin JWT token
const tagId = "683e25c7c3bc9f419dffa464"; // e.g., "665e51a8e2e4bc1357e1aa1a"
const adminToken =
  "eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIn0..I8-IBof3sk8kyaBk.LjAWKGVKd2DNN0QLT3IFTqH8IziZfjMbcSnolt2fOoIbvZ47WD5B0amd8pxZCMkCGEtynKk8ea28ahTS49OYxuv3PoKGvgP3wnlzcD_h58ExjDpPZZK-9zlPL3k-jpGOn8zBbIM8L0N6OmNKgqloCecEf2JX4wpRuq0ngUplmDYTKN13ZgIJc2lXgEF8e1pRm2-qtX2UCo8A8T0n-8VYOERJ2hF0h7sh9R1B65AoDzGdxMhIrmu12D4jAfa8Tpp5sQsFRX7y_WN_TEkv.V46OTdnMwHgrKiShit8n7A"; // From browser DevTools after logging in as admin

const url = `http://localhost:3000/api/tags/${tagId}`;

// 🔧 The fields you want to update
const updates = {
  name: "Immigration & Border Control",
  color: "#0066cc", // Just an example
};

try {
  const response = await fetch(url, {
    method: "PUT",
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
    console.log("✅ Tag successfully updated:\n");
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
