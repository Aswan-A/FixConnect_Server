import mongoose, { Schema, Document } from "mongoose";

export interface IssueRequestDoc extends Document {
  userId: mongoose.Types.ObjectId;
  issueId: mongoose.Types.ObjectId;
  createdAt: Date;
}

const IssueRequestSchema = new Schema<IssueRequestDoc>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    issueId: { type: Schema.Types.ObjectId, ref: "Issue", required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model<IssueRequestDoc>("IssueRequest", IssueRequestSchema);
