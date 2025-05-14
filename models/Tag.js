// /models/Tag.js
import mongoose from "mongoose";

const tagSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    color: {
      type: String,
      trim: true, // optional for UI (e.g., "bg-blue-100 text-blue-800")
    },
  },
  { timestamps: true }
);

tagSchema.index({ name: 1 });

export default mongoose.models.Tag || mongoose.model("Tag", tagSchema);
