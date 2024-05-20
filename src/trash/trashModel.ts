import mongoose from "mongoose";
import { Trash } from "./trashTypes";

const trashSchema = new mongoose.Schema<Trash>(
  {
    sent_to: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      default: "deleted",
    },
    agent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    scheduledAt: {
      type: Date,
      required: true,
    },
    reason: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model<Trash>("Trash", trashSchema);
