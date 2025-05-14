//models/Bill.js
import mongoose from "mongoose";
import provisionSchema from "./schemas/provisionSchema.js";
import amendmentSchema from "./schemas/amendmentSchema.js";

const billSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true, // e.g., "FL-2025-HB-1001"
      unique: true,
      trim: true,
    },
    title: { type: String, required: true },
    sponsor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Politician",
      required: true,
    },
    co_sponsors: [{ type: mongoose.Schema.Types.ObjectId, ref: "Politician" }],
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
  },
  { timestamps: true }
);

billSchema.index({ name: 1 });

export default mongoose.models.Bill || mongoose.model("Bill", billSchema);
