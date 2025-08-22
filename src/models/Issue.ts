import mongoose from 'mongoose';

const issueSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  image: String,
});

const Issue = mongoose.model('Issue', issueSchema, 'Issues');
export default Issue;
