import { Injectable } from '@angular/core';
import ChatServer from '../../../shared-interfaces/server.interface';
import { ChannelList, Channel } from '../../../shared-interfaces/channel.interface';

export default interface Server extends ChatServer {
  channelList?: Array<Channel>;
}
@Injectable()
export class AppStateService {
  public currentServer: Server;

  constructor() { }

  updateChannelsList(channels: ChannelList) {
    if (this.currentServer._id === channels.server_id) {
      this.currentServer.channelList = channels.channels;
      console.log('list', this.currentServer.channelList);
    }
  }
}
