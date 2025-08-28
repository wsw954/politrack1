// /models/schemas/trackedItemSchema.js
import mongoose from "mongoose";

/**
 * Subdocs with _id enabled (default) so we can remove/update by id.
 * Each item also carries its own mini note to explain "why it exists."
 */

const linkSchema = new mongoose.Schema({
  url: { type: String, required: true, trim: true },
  title: { type: String, trim: true },
  note: { type: String, trim: true, default: "" }, // per-link note
  addedAt: { type: Date, default: Date.now },
});

const attachmentSchema = new mongoose.Schema({
  // MVP: images only; expand "enum" later to ["image","pdf","audio","video"]
  kind: { type: String, enum: ["image"], default: "image" },
  url: { type: String, required: true, trim: true }, // S3/CDN URL (store files outside Mongo)
  filename: { type: String, trim: true },
  note: { type: String, trim: true, default: "" }, // per-attachment note
  sourceUrl: { type: String, trim: true }, // optional: attribution/source
  addedAt: { type: Date, default: Date.now },
});

const labelSchema = new mongoose.Schema({
  label: { type: String, required: true, trim: true }, // user-private taxonomy
  // Optional future add: kind: { type: String, enum: ["status","stance","topic","action"] }
  note: { type: String, trim: true, default: "" }, // per-label note (why/what-next)
  addedAt: { type: Date, default: Date.now },
});

/**
 * Reusable "annotation unit" fields:
 * - generalNotes: freeform context for the whole thing
 * - links / attachments / labels: each item has its own mini note
 */
const annotationUnitFields = {
  generalNotes: { type: String, trim: true, default: "" },
  links: { type: [linkSchema], default: [] },
  attachments: { type: [attachmentSchema], default: [] },
  labels: { type: [labelSchema], default: [] },
};

/**
 * Bill-only provision annotations:
 * Each provision can have its own annotation unit.
 * provisionId should reference the ObjectId of the provision within Bill.provisions[i]
 * anchorPath is a human-readable fallback (e.g., "§3(b)(ii)") to survive light edits.
 */
const provisionAnnotationSchema = new mongoose.Schema(
  {
    provisionId: { type: mongoose.Schema.Types.ObjectId, required: true },
    anchorPath: { type: String, trim: true },
    ...annotationUnitFields,
    updatedAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

/**
 * The tracked item itself:
 * - itemId + itemType select the target record
 * - We embed the whole-item annotations directly here
 * - For Bills, we also track provisionAnnotations[]
 */
const trackedItemSchema = new mongoose.Schema(
  {
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "itemType",
    },
    itemType: {
      type: String,
      required: true,
      // You said we’re focusing on Bills & Politicians now; leaving "Tag" here is fine for future use.
      enum: ["Politician", "Bill", "Tag"],
    },

    // ---------- whole-item annotations ----------
    ...annotationUnitFields,

    // ---------- bill-only per-provision annotations ----------
    provisionAnnotations: { type: [provisionAnnotationSchema], default: [] },
  },
  {
    _id: false, // matches your existing embedded usage
    timestamps: true, // retains createdAt/updatedAt on the tracked item doc
  }
);

export default trackedItemSchema;
