import mongoose from "mongoose";

const proUserSchema = new mongoose.Schema({
  userID: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  occupation: String,
  skill: [{ type: String }],
  degree: String,
  certifications: [{ type: String }],
  description: { type: String },
});

const proUser = mongoose.model("proUser", proUserSchema, "proUser");
export default proUser;
