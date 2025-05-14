// /models/schemas/trackedItemSchema.js
import mongoose from "mongoose";

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
      enum: ["Politician", "Bill"],
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

export default trackedItemSchema;
