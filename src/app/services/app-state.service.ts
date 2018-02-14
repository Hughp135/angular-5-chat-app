import { Injectable } from '@angular/core';
import ChatServer from 'shared-interfaces/server.interface';
import { ChannelList, Channel } from 'shared-interfaces/channel.interface';

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
}
