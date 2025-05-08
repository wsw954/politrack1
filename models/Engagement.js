import mongoose from "mongoose";

const EngagementSchema = new mongoose.Schema({
  type: String,
  userId: mongoose.Schema.Types.ObjectId,
  billId: String,
  message: String,
});

export default mongoose.models.Engagement ||
  mongoose.model("Engagement", EngagementSchema);
