import mongoose from 'mongoose';

const issueSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  image: String,
  createdAt: { type: Date, default: Date.now },
  location: {type:String,reuired:true},
  status: { type: String, enum: ['open', 'in progress', 'resolved'], default: 'open' },
  reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  category: { type: String, enum: ['Electronics', 'Electrical', 'Plumbing', 'other'], default: 'other' },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});

const Issue = mongoose.model('Issue', issueSchema, 'Issues');
export default Issue;
