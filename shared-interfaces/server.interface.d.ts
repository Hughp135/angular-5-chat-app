import { ChannelList } from "./channel.interface";

export default interface ChatServer {
  name: string;
  _id: string;
  owner_id?: string;
  channelList?: ChannelList
}
