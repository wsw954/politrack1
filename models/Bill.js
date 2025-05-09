//models/Bill.js
import mongoose from "mongoose";

const billSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      required: true, // e.g., "FL-2025-HB-1001"
    },
    title: {
      type: String,
      required: true, // e.g., "Florida Education Funding Act"
    },
    summary: {
      type: String,
      required: true, // e.g., "Increases funding for public schools by 5% annually."
    },
    key_provisions: {
      type: [String], // e.g., ["Raises teacher salaries by 3%", "Allocates $10M for school infrastructure"]
      default: [],
    },
    why_it_matters: {
      type: String,
      required: true, // e.g., "This bill impacts 1.2M students and 80K teachers."
    },
    tags: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tag",
      },
    ],
    status: {
      current_stage: {
        type: String,
        required: true, // e.g., "Committee"
      },
      timeline: [
        {
          stage: {
            type: String,
            required: true, // e.g., "Introduced"
          },
          date: {
            type: String,
            required: true, // e.g., "2025-03-01"
          },
        },
      ],
    },
    sponsor: {
      type: String, // References the _id of a politician (e.g., "FL-HOUSE-001")
      required: true,
    },
    source_url: {
      type: String,
      required: true, // e.g., "https://myfloridahouse.gov/bill/1001"
    },
  },
  { timestamps: true }
);

export default mongoose.models.Bill || mongoose.model("Bill", billSchema);
