import ChatServer from 'shared-interfaces/server.interface';
import { ChatChannel } from 'shared-interfaces/channel.interface';
import { FriendsStore } from './friends-reducer';
import { Me } from 'shared-interfaces/user.interface';
import { VoiceChannel } from '../../../shared-interfaces/voice-channel.interface';

export interface AppState {
  serverList: ChatServer[];
  currentServer: ChatServer;
  currentChatChannel: ChatChannel;
  currentVoiceChannel: VoiceChannel;
  friends: FriendsStore;
  me: Me;
}
