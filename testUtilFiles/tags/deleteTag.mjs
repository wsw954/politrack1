// deleteTag.mjs
import fetch from "node-fetch";

// Replace with a valid tag ID and a valid admin JWT token
const tagId = "683e1444c3bc9f419dffa460"; // e.g., "665e51a8e2e4bc1357e1aa1a"
const adminToken =
  "eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIn0..NMmdSSG4-N85gm5l.U8N19-3alYfS6qtu9GXnzKfo1J4Ns_AFjfo8nT71vZ_9YoH9o9Cl8Q-mlfSpJDpmj1c6dgTHCjS1YnJXY2ezGpzEobmMG_RMJMRDulxXRfiJwyzl7cSl9f9lJutr2aSoeWFIDGgyUY4XfwBFLcXGG9pOcJ34r9P3QFdGjDu8g6U1vVWGEccqOUn-JHSxcqaj8q06Z5UmanTHyrA7EVr88RqhGOJYk9-aNYKOyQF10pZYKGPuymmkOiYQhVsdmRt8BzWxLHVMAo-BvIB1.fOmwWHcC_CJk9WeJIXEnaA";

const url = `http://localhost:3000/api/tags/${tagId}`;

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
    console.log("🗑️ Tag successfully deleted:\n");
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
