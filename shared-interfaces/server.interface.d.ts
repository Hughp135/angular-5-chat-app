import { ChannelList } from "./channel.interface";

export default interface ChatServer {
  name: string;
  _id: string;
  owner_id?: string;
  channelList?: ChannelList
}

export interface ServerUserList {
  server_id: string;
  users: Array<{
    user_id: string;
    username: string;
    online: boolean;
  }>
}
