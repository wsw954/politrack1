// /models/user.js
import mongoose from "mongoose";
import trackedItemSchema from "./schemas/trackedItemSchema.js";
import trackedTagSchema from "./schemas/trackedTagSchema.js";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      select: false,
      minlength: 6,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    tracker: {
      politicians: [trackedItemSchema],
      bills: [trackedItemSchema],
      tags: [trackedTagSchema],
    },
  },

  { timestamps: true }
);

// Prevent model overwrite on hot reload in dev
const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;
