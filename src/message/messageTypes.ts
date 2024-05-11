export interface Message {
  _id: string;
  sent_to: string;
  message: string;
  status: string;
  agent: string;
  scheduled_at: Date;
}
