import { User } from "../user/userTypes";

export interface Task {
  _id: string;
  sent_to: string;
  message: string;
  status: string;
  user: User;
  scheduled_at: Date;
}
