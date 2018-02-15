export interface SendMessageRequest {
  message: string;
  channel_id: string;
}

export interface ChatMessage {
  message: string;
  channel_id: string;
  user_id: string;
  username: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}
