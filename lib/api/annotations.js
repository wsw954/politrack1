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

export async function getProvisionAnnotations(userId, billId, provId) {
  const res = await fetch(
    `/api/users/${userId}/tracker/bills/${billId}/provisions/${provId}/annotations`,
    { cache: "no-store" }
  );
  if (!res.ok) throw new Error("Failed to load provision annotations");
  return res.json();
}

export async function putProvisionAnnotations(userId, billId, provId, payload) {
  const res = await fetch(
    `/api/users/${userId}/tracker/bills/${billId}/provisions/${provId}/annotations`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }
  );
  if (!res.ok) throw new Error("Failed to save provision annotations");
  return res.json();
}

export async function deleteProvisionAnnotations(userId, billId, provId) {
  const res = await fetch(
    `/api/users/${userId}/tracker/bills/${billId}/provisions/${provId}/annotations`,
    { method: "DELETE" }
  );
  if (!res.ok) throw new Error("Failed to clear provision annotations");
  return res.json();
}
