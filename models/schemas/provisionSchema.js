//models/schemas/provisionSchema.js
import mongoose from "mongoose";

const { Schema } = mongoose;

// Helper to trim strings (used by setters below)
const trimIfString = (v) => (typeof v === "string" ? v.trim() : v);

// A small helper to trim all values inside a plain object or Map
const trimAllStringValues = (input) => {
  if (input == null) return input;
  if (input instanceof Map) {
    const out = new Map();
    for (const [k, v] of input.entries()) out.set(k, trimIfString(v));
    return out;
  }
  if (typeof input === "object") {
    const out = {};
    for (const k of Object.keys(input)) out[k] = trimIfString(input[k]);
    return out;
  }
  return input;
};

/**
 * Individual legal text entry inside a provision.
 * Known fields are validated; optional fields are simply not 'required'.
 * 'extras' holds any arbitrary { key: string -> value: string } pairs
 * such as "amendment", "editor_note", etc.
 */
const legalTextItemSchema = new Schema(
  {
    section: { type: String, trim: true, required: true }, // e.g. "784.046(1)(a)"
    statute_ref: { type: String, trim: true }, // optional
    title: { type: String, trim: true }, // optional
    text: { type: String, trim: true, required: true }, // required
    source_page: { type: Number }, // optional

    // Flexible bucket for additional string properties
    // Example usage in a document:
    //   extras: { amendment: "Adds subsection (3)", editor_note: "Cross-check later" }
    extras: {
      type: Map,
      of: {
        type: String,
        set: trimIfString, // ensure every value is trimmed
      },
      default: undefined, // omit if empty
    },
  },
  {
    _id: true,
    strict: true, // enforce known fields
    minimize: true, // do not store empty objects
  }
);

// Optional: ensure Maps or plain objects assigned to `extras` get trimmed
legalTextItemSchema.path("extras").set(trimAllStringValues);

/**
 * Provision schema aligned with your Bill JSON, using the flexible legalTextItemSchema.
 */
const provisionSchema = new Schema(
  {
    section_number: { type: String, trim: true, required: true },
    heading: { type: String, trim: true, required: true },

    // Now an array of subdocs that can carry extras
    legal_text: { type: [legalTextItemSchema], default: [] },

    summary: { type: String, trim: true, default: "" },
    why_it_matters: { type: String, trim: true, default: "" },

    tags: [{ type: Schema.Types.ObjectId, ref: "Tag", index: true }],

    type: {
      type: String,
      enum: [
        "standard",
        "definition",
        "appropriation",
        "preamble",
        "reenactment",
        "effective_date",
        "amendment",
      ],
      default: "standard",
    },
  },
  { _id: true }
);

export default provisionSchema;
