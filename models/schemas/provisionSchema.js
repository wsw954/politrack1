//models/schemas/provisionSchema.js
import mongoose from "mongoose";

const provisionSchema = new mongoose.Schema(
  {
    section_number: String, // e.g., "Section 3", "Effective Date", or "Definitions"
    heading: String, // Human-readable label
    legal_text: String, // Raw legal section text
    summary: String, // Plain English explanation
    why_it_matters: String, // User-facing context
    tags: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tag",
      },
    ],
    type: {
      type: String, // "standard", "definition", "appropriation", "preamble", etc
      default: "standard", // could be "definition", "appropriation", etc.
    },
  },
  { _id: false }
);

export default provisionSchema;
