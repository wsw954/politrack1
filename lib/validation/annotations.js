// lib/validation/annotations.js
import mongoose from "mongoose";

// helpers
const clamp = (s, max = 20000) =>
  typeof s === "string" ? s.slice(0, max) : "";

const safeStr = (s, max = 2000) =>
  typeof s === "string" ? s.slice(0, max) : "";

const isValidUrl = (u) => {
  try {
    const x = new URL(String(u));
    return !!x.protocol && !!x.host;
  } catch {
    return false;
  }
};

export const isObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

/**
 * Sanitize a bill/provision annotations payload.
 * Returns { value, errors } where value is always safe to write to DB.
 */
export function sanitizeAnnotations(input = {}) {
  const errors = [];

  const generalNotes = clamp(input.generalNotes, 20000);

  const links = Array.isArray(input.links) ? input.links : [];
  const cleanLinks = links
    .filter((l) => l && typeof l.url === "string" && l.url.trim())
    .map((l) => {
      const url = String(l.url).trim();
      if (!isValidUrl(url)) {
        errors.push(`Invalid link URL: ${url}`);
        return null;
      }
      return {
        url,
        title: safeStr(l.title, 200),
        note: safeStr(l.note, 1000),
      };
    })
    .filter(Boolean);

  const labels = Array.isArray(input.labels) ? input.labels : [];
  const cleanLabels = labels
    .filter((x) => x && typeof x.label === "string" && x.label.trim())
    .map((x) => ({
      label: safeStr(x.label, 64),
      note: safeStr(x.note, 500),
    }));

  const attachments = Array.isArray(input.attachments) ? input.attachments : [];
  const cleanAttachments = attachments
    .filter((a) => a && typeof a.url === "string" && a.url.trim())
    .map((a) => ({
      url: String(a.url).trim(),
      alt: safeStr(a.alt, 200),
      note: safeStr(a.note, 500),
    }));

  return {
    value: {
      generalNotes,
      links: cleanLinks,
      labels: cleanLabels,
      attachments: cleanAttachments,
    },
    errors,
  };
}
