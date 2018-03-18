import { Component, OnInit, Input } from '@angular/core';
import { ChatChannel, ChannelListItem } from 'shared-interfaces/channel.interface';
import { WebsocketService } from '../../services/websocket.service';
import { CreateChannelRequest } from 'shared-interfaces/channel.interface';
import ChatServer from '../../../../shared-interfaces/server.interface';
import { SettingsService } from '../../services/settings.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-channels-list',
  templateUrl: './channels-list.component.html',
  styleUrls: ['./channels-list.component.scss'],
})
export class ChannelsListComponent implements OnInit {
  public newChannelName: string;
  @Input() currentChatChannel: ChatChannel;
  @Input() currentServer: ChatServer;

  constructor(
    private wsService: WebsocketService,
    public settingsService: SettingsService,
    private router: Router,
  ) {
  }

  ngOnInit() {
  }

  get channelList() {
    return this.currentServer.channelList;
  }

  joinChannel(channel: ChannelListItem) {
    this.router.navigate([`channels/${channel.server_id}/${channel._id}`]);
  }

  createChannel() {
    const channel: CreateChannelRequest = {
      server_id: this.currentServer._id,
      name: this.newChannelName,
    };
    this.wsService.socket.emit('create-channel', channel);
  }
}
