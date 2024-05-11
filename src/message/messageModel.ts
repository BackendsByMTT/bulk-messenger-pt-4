import mongoose from "mongoose";
import { Message } from "./messageTypes";

const messageSchema = new mongoose.Schema<Message>(
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
      type: String,
      required: true,
    },
    scheduled_at: {
      type: Date,
    },
  },
  { timestamps: true }
);

export default mongoose.model<Message>("Message", messageSchema);
