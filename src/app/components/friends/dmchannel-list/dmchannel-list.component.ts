import { Component, OnInit, Input, ChangeDetectionStrategy } from '@angular/core';
import { ChatChannel } from 'shared-interfaces/channel.interface';
import ChatServer from 'shared-interfaces/server.interface';
import { SettingsService } from '../../../services/settings.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dmchannel-list',
  templateUrl: './dmchannel-list.component.html',
  styleUrls: ['./dmchannel-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DmchannelListComponent implements OnInit {
  @Input() currentChatChannel: ChatChannel;
  @Input() currentServer: ChatServer;

  constructor(
    public settingsService: SettingsService,
    private router: Router,
  ) { }

  ngOnInit() {
  }

  getChannelName(channel: ChatChannel) {
    const userId = channel.user_ids[1];
    const user = this.currentServer.channelList.users[userId];
    return user ? user.username : 'Unknown';
  }

  joinChannel(channel: ChatChannel) {
    this.router.navigate([`friends/${channel._id}`]);
  }
}
