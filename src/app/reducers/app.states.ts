import ChatServer from 'shared-interfaces/server.interface';
import { ChatChannel } from 'shared-interfaces/channel.interface';

export interface AppState {
  serverList: ChatServer[];
  currentServer: ChatServer;
  currentChatChannel:  ChatChannel;
}
