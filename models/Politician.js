import mongoose from 'mongoose';

const PoliticianSchema = new mongoose.Schema({
  name: String,
  party: String,
  district: String
});

export default mongoose.models.Politician || mongoose.model('Politician', PoliticianSchema);
