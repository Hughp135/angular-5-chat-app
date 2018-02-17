import ChatServer from 'shared-interfaces/server.interface';
import { Channel } from 'shared-interfaces/channel.interface';

export interface AppState {
  serverList: ChatServer[];
  currentServer: Server;
  currentChannel:  Channel;
}

export interface Server extends ChatServer {
  channelList?: Channel[];
}
