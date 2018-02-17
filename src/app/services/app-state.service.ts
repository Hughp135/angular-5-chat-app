import { Injectable } from '@angular/core';
import ChatServer from 'shared-interfaces/server.interface';
import { ChannelList, Channel } from 'shared-interfaces/channel.interface';
import { ChatMessage } from 'shared-interfaces/message.interface';

export default interface Server extends ChatServer {
  channelList?: Array<Channel>;
}
@Injectable()
export class AppStateService {
  public currentServer: Server;
  public currentChatChannel: Channel;

  constructor() { }

  updateChannelsList(data: ChannelList) {
    if (this.currentServer._id === data.server_id) {
      this.currentServer.channelList = data.channels;
    }
  }

  addMessage(message: ChatMessage) {
    if (message.channel_id === this.currentChatChannel._id) {
      if (!this.currentChatChannel.messages) {
        this.currentChatChannel.messages = [];
      }
      this.currentChatChannel.messages.unshift(message);
    }
  }
}
