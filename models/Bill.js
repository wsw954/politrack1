import mongoose from 'mongoose';

const BillSchema = new mongoose.Schema({
  title: String,
  summary: String,
  tags: [String],
  status: String
});

export default mongoose.models.Bill || mongoose.model('Bill', BillSchema);
