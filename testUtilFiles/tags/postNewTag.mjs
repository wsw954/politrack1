// postNewTag.mjs

import fetch from "node-fetch";

// 🔐 Replace this with a real admin JWT token (see notes below)
const adminToken =
  "eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIn0..NMmdSSG4-N85gm5l.U8N19-3alYfS6qtu9GXnzKfo1J4Ns_AFjfo8nT71vZ_9YoH9o9Cl8Q-mlfSpJDpmj1c6dgTHCjS1YnJXY2ezGpzEobmMG_RMJMRDulxXRfiJwyzl7cSl9f9lJutr2aSoeWFIDGgyUY4XfwBFLcXGG9pOcJ34r9P3QFdGjDu8g6U1vVWGEccqOUn-JHSxcqaj8q06Z5UmanTHyrA7EVr88RqhGOJYk9-aNYKOyQF10pZYKGPuymmkOiYQhVsdmRt8BzWxLHVMAo-BvIB1.fOmwWHcC_CJk9WeJIXEnaA";

const url = "http://localhost:3000/api/tags";

// New Tag JSON to insert
const newTag = {
  name: "Test Tag",
  keywords: ["Keyword 123", "No tax on tips", "Jack Sparrow"],
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
