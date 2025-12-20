// lib/api/annotations.js
export async function getBillAnnotations(userId, billId) {
  const res = await fetch(
    `/api/users/${userId}/tracker/bills/${billId}/annotations`,
    { cache: "no-store" }
  );
  if (!res.ok) throw new Error("Failed to load annotations");
  return res.json();
}

export async function putBillAnnotations(userId, billId, payload) {
  const res = await fetch(
    `/api/users/${userId}/tracker/bills/${billId}/annotations`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }
  );
  if (!res.ok) throw new Error("Failed to save annotations");
  return res.json();
}

export async function deleteBillAnnotations(userId, billId) {
  const res = await fetch(
    `/api/users/${userId}/tracker/bills/${billId}/annotations`,
    { method: "DELETE" }
  );
  if (!res.ok) throw new Error("Failed to clear annotations");
  return res.json();
}

export async function getProvisionAnnotations(userId, billId, pid) {
  console.log("Line 34 in lib/api/annotations");
  const res = await fetch(
    `/api/users/${userId}/tracker/bills/${billId}/provisions/${pid}/annotations`,
    { cache: "no-store" }
  );
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("Failed to load provision annotations");
  return res.json();
}

export async function putProvisionAnnotations(userId, billId, pid, payload) {
  const res = await fetch(
    `/api/users/${userId}/tracker/bills/${billId}/provisions/${pid}/annotations`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }
  );
  if (!res.ok) throw new Error("Failed to save provision annotations");
  return res.json();
}

export async function deleteProvisionAnnotations(userId, billId, pid) {
  const res = await fetch(
    `/api/users/${userId}/tracker/bills/${billId}/provisions/${pid}/annotations`,
    { method: "DELETE" }
  );
  if (!res.ok) throw new Error("Failed to clear provision annotations");
  return res.json();
}
