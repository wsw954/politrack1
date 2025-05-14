//models/schemas/amendmentSchema.js
import mongoose from "mongoose";

const amendmentSchema = new mongoose.Schema(
  {
    date: String,
    description: String, // "Added clause to clarify reporting requirements"
    affected_section: String, // e.g., "Section 2"
    text: String, // Amendment text
  },
  { _id: false }
);

export default amendmentSchema;
