import { ChatMessage } from "./message.interface";
import { VoiceChannel } from "./voice-channel.interface";

export interface CreateChannelRequest {
  name: string;
  server_id: string;
}

export interface ChatChannel {
  _id: string;
  name: string;
  server_id?: string;
  messages?: ChatMessage[];
  user_ids?: string[];
  last_checked?: Date;
}

export interface ChannelList {
  server_id: string;
  channels: ChannelListItem[];
  users?: any;
  voiceChannels: VoiceChannel[];
}

export interface ChannelListItem {
  _id: string;
  name: string;
  server_id?: string;
  has_unread_messages?: boolean;
  user_ids?: string[];
  last_message: Date;
}

export interface JoinedChannelResponse {
  channel_id: string;
  messages: ChatMessage[];
}
