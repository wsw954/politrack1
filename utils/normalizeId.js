// utils/normalizeId.js

/**
 * Normalize any _id-like field to a string for use in UI or routing.
 * Accepts:
 * - String (returns as-is)
 * - MongoDB ObjectId object (returns .toString() if available)
 * - {$oid: "..."} (returns the string value)
 * - null/undefined (returns empty string)
 */
export function normalizeId(id) {
  if (typeof id === "string") return id;
  if (id && typeof id === "object") {
    if ("$oid" in id) return id.$oid;
    if (typeof id.toString === "function") return id.toString();
  }
  return "";
}
