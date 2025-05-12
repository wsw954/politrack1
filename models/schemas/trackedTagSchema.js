// /models/schemas/trackedTagSchema.js
import mongoose from "mongoose";

const trackedTagSchema = new mongoose.Schema(
  {
    tagId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tag",
      required: true,
    },
    note: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    _id: false,
    timestamps: true,
  }
);

export default trackedTagSchema;
