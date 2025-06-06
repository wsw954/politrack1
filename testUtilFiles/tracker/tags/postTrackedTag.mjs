//testUtilFiles/tracker/postTrackedTag.mjs

import fetch from "node-fetch";

// Replace with your actual values
const userId = "68193fe0828a4de759ad6d78";
const sessionToken =
  "eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIn0..Hl5170t-siED8lca.uaF4PYHLOPVJfs2bv55QRtnEB2v1HyU3VLrVeVlFjf46mbIzE3QnL8wAj4EACKYl_Od1WjYLlUNeOhZeRDc8pyRpdsOSh-ZtKw876-GUL5Tf1vMg4WVf_sPh6xltaz0s8rDh1VrZKH-187NBcjG1CvyX-trogeVUCZHi5C-5h_eF-4WRyOkV7QXd_QgQKoXuS_Ku-GLXjSjfnP1NYNsX0qWRvWroGKoHJtZG0JriPm83NwnNaSbEurDOy2T3jsfQFRxrK3FYPNbS5B0ixiHpzw.oPhN7eizE0gO1_P2mCH4BQ"; // ← Paste from browser via Notepad

const url = `http://localhost:3000/api/users/${userId}/tracker/tags`;

const newTrackedTag = {
  tagId: "683e25c7c3bc9f419dffa464",
  note: "Start looking out for Criminal Deportations",
};

try {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: `next-auth.session-token=${sessionToken}`,
    },
    body: JSON.stringify(newTrackedTag),
  });

  const contentType = response.headers.get("content-type");
  const isJson = contentType && contentType.includes("application/json");
  const data = isJson ? await response.json() : null;

  if (response.ok) {
    console.log("✅ Successfully added tracked tag:\n");
    console.log(JSON.stringify(data, null, 2));
  } else {
    console.error(`❌ HTTP ${response.status} — ${response.statusText}`);

    if (response.status === 401) {
      console.error("🔒 Unauthorized — Check your session token.");
    } else if (response.status === 403) {
      console.error("🚫 Forbidden — The userId may not match the session.");
    } else if (response.status === 409) {
      console.error("⚠️ Conflict — This tag may already be tracked.");
    }

    if (data?.error) {
      console.error(`🛑 API Error Message: ${data.error}`);
    }
  }
} catch (err) {
  console.error("💥 Network or server error:", err.message);
}
