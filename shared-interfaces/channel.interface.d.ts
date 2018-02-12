export interface CreateChannelRequest {
  name: string;
  server_id: string;
}

export interface Channel {
  name: string;
  server_id: string;
}

export interface ChannelList {
  server_id: string;
  channels: Array<Channel>;
}
