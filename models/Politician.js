//models/Politician.js
import mongoose from "mongoose";

const politicianSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true, // e.g., "FL-HOUSE-001"
  },
  first_name: {
    type: String,
    required: true, // e.g., "Alicia"
  },
  last_name: {
    type: String,
    required: true, // e.g., "Martinez"
  },
  party: {
    type: String,
    required: true,
    enum: ["Democrat", "Republican", "Independent"], // Restrict to valid parties
  },
  chamber: {
    type: String,
    required: true,
    enum: ["House", "Senate"], // Restrict to valid chambers
  },
  district: {
    type: String,
    required: true, // e.g., "District 10"
  },
  photo_url: {
    type: String,
    required: true, // e.g., "/app/public/politicians/images/alicia_martinez.jpg"
  },
  contact: {
    email: {
      type: String,
      required: true, // e.g., "alicia.martinez@myfloridahouse.gov"
    },
    phone: {
      type: String,
      required: true, // e.g., "850-717-5010"
    },
    social_media: {
      twitter: {
        type: String, // e.g., "@AliciaMartinezFL"
        default: null,
      },
    },
  },
  committee_assignments: {
    type: [String], // e.g., ["Education", "Health Care"]
    default: [],
  },
  voting_history: [
    {
      bill_id: {
        type: String,
        required: true, // e.g., "FL-2025-HB-1001"
      },
      vote: {
        type: String,
        required: true,
        enum: ["Yes", "No", "Abstain", "Absent"], // Match vote types from design
      },
      session: {
        type: String,
        required: true, // e.g., "2025"
      },
      topic: {
        type: String,
        required: true, // e.g., "Education"
      },
    },
  ],
  consistency_meter: {
    party_alignment: {
      type: Number,
      min: 0,
      max: 100, // e.g., 90
    },
    topic_consistency: {
      type: Map,
      of: Number, // e.g., { "Education": 95, "Housing": 80 }
      default: {},
    },
  },
  last_updated: {
    type: String,
    required: true, // e.g., "2025-04-20"
  },
});

export default mongoose.models.Politician ||
  mongoose.model("Politician", politicianSchema);
