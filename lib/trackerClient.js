// lib/trackerClient.js

/**
 * Small fetch wrapper so all calls behave the same.
 * - Throws on non-2xx with {status, message} for your toasts.
 * - Sends cookies by default (NextAuth session).
 */
async function request(
  path,
  { method = "GET", body, cache = "no-store" } = {}
) {
  const res = await fetch(path, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
    cache, // GETs: avoid stale auth/data
    credentials: "include",
  });

  // Try to parse JSON even on error responses
  let data = null;
  try {
    data = await res.json();
  } catch {}

  if (!res.ok) {
    const msg =
      (data && (data.error || data.message)) ||
      `Request failed (${res.status})`;
    const err = new Error(msg);
    err.status = res.status;
    err.payload = data;
    throw err;
  }
  return data;
}

/* ------------------------------ Session ------------------------------ */

export async function getSessionJson() {
  return request(`/api/auth/session`);
}

/* ------------------------------- Bills -------------------------------- */

export async function getTrackedBills(userId) {
  return request(`/api/users/${userId}/tracker/bills`);
}

/**
 * includeProvisions: boolean -> adds ?includeProvisions=1
 * Returns the single tracked bill + (optionally) provision annotations joined with provision text.
 */
export async function getTrackedBill(
  userId,
  billId,
  { includeAnnotations = true } = {}
) {
  const qs = includeAnnotations ? "?with=annotations" : "";
  return request(`/api/users/${userId}/tracker/bills/${billId}${qs}`);
}

/**
 * Whole-bill annotations PUT payload shape (all optional):
 * {
 *   generalNotes?: string,
 *   addLinks?: [{url, title?, note?}],
 *   removeLinkIds?: [string],
 *   addAttachments?: [{kind:"image", url, filename?, note?, sourceUrl?}],
 *   removeAttachmentIds?: [string],
 *   addLabels?: [{label, note?}],
 *   removeLabelIds?: [string]
 * }
 */
// export async function patchTrackedBill(userId, billId, payload) {
//   return request(`/api/users/${userId}/tracker/bills/${billId}`, {
//     method: "PATCH",
//     body: payload,
//   });
// }
export async function putBillAnnotations(userId, billId, payload) {
  return request(`/api/users/${userId}/tracker/bills/${billId}/annotations`, {
    method: "PUT",
    body: payload,
  });
}

/**
 * Provision-level annotations PATCH payload shape (all optional):
 * {
 *   generalNotes?: string,
 *   anchorPath?: string,
 *   addLinks?: [{url, title?, note?}],
 *   removeLinkIds?: [string],
 *   addAttachments?: [{kind:"image", url, filename?, note?, sourceUrl?}],
 *   removeAttachmentIds?: [string],
 *   addLabels?: [{label, note?}],
 *   removeLabelIds?: [string]
 * }
 */
export async function patchTrackedBillProvision(
  userId,
  billId,
  provId,
  payload
) {
  return request(
    `/api/users/${userId}/tracker/bills/${billId}/provisions/${provId}`,
    {
      method: "PATCH",
      body: payload,
    }
  );
}

/* Optional but handy */
export async function deleteTrackedBill(userId, billId) {
  return request(`/api/users/${userId}/tracker/bills/${billId}`, {
    method: "DELETE",
  });
}
export async function deleteProvisionAnnotation(userId, billId, provId) {
  return request(
    `/api/users/${userId}/tracker/bills/${billId}/provisions/${provId}`,
    {
      method: "DELETE",
    }
  );
}

/* ---------------------------- Politicians ----------------------------- */

export async function getTrackedPoliticians(userId) {
  return request(`/api/users/${userId}/tracker/politicians`);
}

/**
 * Returns:
 * {
 *   politician: { first_name, last_name, party, chamber, district, photo_url, contact, committee_assignments, consistency_meter, updatedAt, ... },
 *   annotations: { generalNotes, links, attachments, labels, ... },
 *   createdAt, updatedAt
 * }
 */
export async function getTrackedPolitician(userId, polId) {
  return request(`/api/users/${userId}/tracker/politicians/${polId}`);
}

/**
 * Whole-item annotations PATCH payload (same shape as bills' whole-item PATCH).
 */
export async function patchTrackedPolitician(userId, polId, payload) {
  return request(`/api/users/${userId}/tracker/politicians/${polId}`, {
    method: "PATCH",
    body: payload,
  });
}

/* Optional but handy */
export async function deleteTrackedPolitician(userId, polId) {
  return request(`/api/users/${userId}/tracker/politicians/${polId}`, {
    method: "DELETE",
  });
}
