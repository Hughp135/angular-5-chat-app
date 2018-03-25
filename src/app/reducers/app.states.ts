import ChatServer from 'shared-interfaces/server.interface';
import { ChatChannel } from 'shared-interfaces/channel.interface';
import { FriendsStore } from './friends-reducer';
import { Me } from 'shared-interfaces/user.interface';

export interface AppState {
  serverList: ChatServer[];
  currentServer: ChatServer;
  currentChatChannel:  ChatChannel;
  friends: FriendsStore;
  me: Me;
}
