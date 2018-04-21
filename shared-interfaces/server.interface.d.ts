import { ChannelList } from "./channel.interface";

export default interface ChatServer {
  name: string;
  _id: string;
  image_url?: string;
  owner_id?: string;
  channelList?: ChannelList;
  userList?: UserListUser[];
  invite_id? : string;
}

export interface UserListUser {
  _id: string;
  username: string;
  online: boolean;
}
export interface ServerUserList {
  server_id: string;
  users: UserListUser[]
}

export interface UserListUpdate {
  server_id: string;
  user: UserListUser;
}
