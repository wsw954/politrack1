//models/Bill.js
import mongoose from "mongoose";
import provisionSchema from "./schemas/provisionSchema.js";
import amendmentSchema from "./schemas/amendmentSchema.js";

const billSchema = new mongoose.Schema(
  {
    number: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    title: { type: String, required: true },
    type: { type: String, required: true, unique: true },
    session: {
      type: String, // or Number if you prefer
      required: true,
      trim: true, // e.g., "2025"
    },
    summary: { type: String },
    sponsor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Politician",
      required: true,
    },
    co_sponsors: [{ type: mongoose.Schema.Types.ObjectId, ref: "Politician" }],
    tags: [{ type: mongoose.Schema.Types.ObjectId, ref: "Tag" }],
    enacting_clause: {
      type: String,
      default: "Be It Enacted by the Legislature of the State of Florida:",
    },
    provisions: [provisionSchema],
    has_severability_clause: { type: Boolean, default: false },
    contains_appropriation: { type: Boolean, default: false },
    chapter_references: [String],
    effective_date: { type: String, required: true },
    amendments: [amendmentSchema],
    status: {
      current_stage: String,
      timeline: [
        {
          stage: String,
          date: String,
        },
      ],
    },
    source_url: { type: String, required: true },

    // ✅ Catch-all field for any additional dynamic info
    extra_info: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: {},
    },

    // Optional Future Expansions
    preliminary_recitals: String,
    sunset_clause: String,
    emergency_clause: Boolean,
    rulemaking_authority: [String],
    grant_programs: [
      {
        name: String,
        description: String,
        funding_amount: String,
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.models.Bill || mongoose.model("Bill", billSchema);
