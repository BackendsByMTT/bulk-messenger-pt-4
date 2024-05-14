import mongoose from "mongoose";
import { Keys } from "./AdminKeyTypes";
const keySchema = new mongoose.Schema<Keys>(
  {
    key: {
      type: String,
      unique: true,
      required: true,
    },
  },
  { timestamps: true }
);
export default mongoose.model<Keys>("AdminKeyModel", keySchema);
