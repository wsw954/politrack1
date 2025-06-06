// postNewTag.mjs

import fetch from "node-fetch";

// 🔐 Replace this with a real admin JWT token (see notes below)
const adminToken =
  "eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIn0..iZ5g0pfrqgBg9ISX.CAoNAYivyKshWVDYiiZOizFkwZytdyHeZ1VxAKqQwO1hGFdqkz8DAPDB13-KE_C1VNW29oTGzgsZSGsXlgi-7W9l1UIP-NrebMSDJ_LPLbz767qt4OKbqxvv3xfMoNaohjScrD8tKOYVJtc8G8vrcm6gdYtp8AWmHHEBUXNVxqqD-WUCLMrcFc41nhcZ-27Qbl3MRbZCpDa_X6Ojja8_Zv6STgSvb8xze-M0gafIKGdp72pgS9UySk_mPMj6gYjnGx7kOQl1MZGNqa03.9uB-imwi88EK5rl5iILvUg";

const url = "http://localhost:3000/api/tags";

// New Tag JSON to insert
const newTag = {
  name: "Big Beatiful Bill",
  keywords: ["No Tax on Overtime", "No tax on tips", "Build the wall"],
  color: "",
};

try {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify(newTag),
  });

  const contentType = response.headers.get("content-type");
  const isJson = contentType && contentType.includes("application/json");
  const data = isJson ? await response.json() : null;

  if (response.ok) {
    console.log("✅ Tag successfully created:\n");
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
