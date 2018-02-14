import { Component, OnInit } from '@angular/core';
import { Channel } from 'shared-interfaces/channel.interface';
import { AppStateService } from '../../services/app-state.service';
import { WebsocketService } from '../../services/websocket.service';
import { CreateChannelRequest } from 'shared-interfaces/channel.interface';

@Component({
  selector: 'app-channels-list',
  templateUrl: './channels-list.component.html',
  styleUrls: ['./channels-list.component.scss']
})
export class ChannelsListComponent implements OnInit {
  public newChannelName: string;

  constructor(
    public appState: AppStateService,
    private wsService: WebsocketService,
  ) {
  }

  ngOnInit() {
  }

  joinChannel(channel: Channel) {
    this.appState.currentChatChannel = channel;
    this.wsService.socket.emit('join-channel', channel._id);
  }

  createChannel() {
    const channel: CreateChannelRequest = {
      server_id: this.appState.currentServer._id,
      name: this.newChannelName,
    };
    this.wsService.socket.emit('create-channel', channel);
  }
}
