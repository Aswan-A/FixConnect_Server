import mongoose from "mongoose";

const proUserSchema = new mongoose.Schema({
  userID: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  occupation: String,
  skill: [{ type: String }],
  Degee: String,
  certifications: [{ type: String }],
  description: { type: String },
});

const proUser = mongoose.model("User", proUserSchema, "User");
export default proUser;
