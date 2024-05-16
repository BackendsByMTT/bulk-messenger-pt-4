import { User } from "../user/userTypes";

export interface Trash {
  _id: string;
  sent_to: string;
  message: string;
  status: string;
  agent: User;
  scheduledAt: Date;
  reason: string;
}
