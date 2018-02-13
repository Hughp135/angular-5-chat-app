export interface CreateChannelRequest {
  name: string;
  server_id: string;
}

export interface Channel {
  _id: string;
  name: string;
  server_id: string;
}

export interface ChannelList {
  server_id: string;
  channels: Array<Channel>;
}
