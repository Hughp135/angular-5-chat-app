import { Component, OnInit, Input, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { ChatChannel, ChannelListItem } from 'shared-interfaces/channel.interface';
import { WebsocketService } from '../../services/websocket.service';
import { CreateChannelRequest } from 'shared-interfaces/channel.interface';
import ChatServer from '../../../../shared-interfaces/server.interface';
import { SettingsService } from '../../services/settings.service';
import { Router } from '@angular/router';
import { ChannelSettingsService } from '../../services/channel-settings.service';

@Component({
  selector: 'app-channels-list',
  templateUrl: './channels-list.component.html',
  styleUrls: ['./channels-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChannelsListComponent implements OnInit {
  public newChannelName: string;
  @Input() currentChatChannel: ChatChannel;
  @Input() currentServer: ChatServer;

  constructor(
    private wsService: WebsocketService,
    public settingsService: SettingsService,
    private channelSettings: ChannelSettingsService,
    private router: Router,
    private ref: ChangeDetectorRef,
  ) {
  }

  ngOnInit() {
    this.settingsService.invertedThemeSubj.subscribe(val => {
      this.ref.detectChanges();
    });
  }

  get channelList() {
    return this.currentServer.channelList;
  }

  joinChannel(channel: ChannelListItem) {
    this.router.navigate([`channels/${channel.server_id}/${channel._id}`]);
  }

  channelHasUnreadMessages(channel: ChannelListItem) {
    if (this.currentChatChannel && this.currentChatChannel._id === channel._id) {
      return false;
    }

    const channelVisited = this.channelSettings.channelsVisited[channel._id];
    const lastCheckedTime = channelVisited ? new Date(channelVisited).getTime() : 0;
    const messageDate = new Date(channel.last_message).getTime();

    return messageDate > lastCheckedTime;
  }

  createChannel() {
    const channel: CreateChannelRequest = {
      server_id: this.currentServer._id,
      name: this.newChannelName,
    };
    this.wsService.socket.emit('create-channel', channel);
  }
}
