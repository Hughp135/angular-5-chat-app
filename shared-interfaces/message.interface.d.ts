export interface SendMessageRequest {
  message: string;
  channel_id: string;
  server_id: string;
}

export interface ChatMessage {
  _id?: string;
  message: string;
  channel_id: string;
  user_id: string;
  username: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}
