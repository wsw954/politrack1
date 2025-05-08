// /models/schemas/trackedItemSchema.js
import mongoose from "mongoose";

const trackedItemSchema = new mongoose.Schema(
  {
    itemId: {
      type: String,
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
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

export default trackedItemSchema;
