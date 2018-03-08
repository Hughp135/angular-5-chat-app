import ChatServer from 'shared-interfaces/server.interface';
import { ChatChannel } from 'shared-interfaces/channel.interface';
import { FriendsStore } from './friends-reducer';

export interface AppState {
  serverList: ChatServer[];
  currentServer: ChatServer;
  currentChatChannel:  ChatChannel;
  friends: FriendsStore;
}
