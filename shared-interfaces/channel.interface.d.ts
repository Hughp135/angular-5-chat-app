import { ChatMessage } from "./message.interface";

export interface CreateChannelRequest {
  name: string;
  server_id: string;
}

export interface ChatChannel {
  _id: string;
  name: string;
  server_id: string;
  messages?: Array<ChatMessage>;
}

export interface ChannelList {
  server_id: string;
  channels: Array<ChatChannel>;
}
