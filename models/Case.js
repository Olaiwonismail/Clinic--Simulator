import mongoose from "mongoose";

const CaseSchema = new mongoose.Schema({
  id: Number,
  title: String,
  patient: String,
  age: Number,
  gender: String,
  duration: String,
  difficulty: String,
  description: String,
  color: String,
  reference: String,
  created_by: String,
});

export default mongoose.models.Case || mongoose.model("Case", CaseSchema);
