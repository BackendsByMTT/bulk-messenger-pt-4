import mongoose from "mongoose";
import { Task } from "./taskTypes";

const taskSchema = new mongoose.Schema<Task>(
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
      default: "pending",
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
  },
  { timestamps: true }
);

export default mongoose.model<Task>("Task", taskSchema);
