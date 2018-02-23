import { Component, OnInit, Input, ChangeDetectionStrategy } from '@angular/core';
import { ChatChannel } from 'shared-interfaces/channel.interface';
import { WebsocketService } from '../../services/websocket.service';
import { CreateChannelRequest } from 'shared-interfaces/channel.interface';
import { Store } from '@ngrx/store';
import { AppState } from '../../reducers/app.states';
import { Observable } from 'rxjs/Observable';
import { JOIN_CHANNEL } from '../../reducers/current-chat-channel.reducer';
import ChatServer from '../../../../shared-interfaces/server.interface';
import { SettingsService } from '../../services/settings.service';

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
    private store: Store<AppState>,
    public settingsService: SettingsService,
  ) {
  }

  ngOnInit() {
  }

  get channelList() {
    return this.currentServer.channelList;
  }

  joinChannel(channel: ChatChannel) {
    this.store.dispatch({
      type: JOIN_CHANNEL,
      payload: channel
    });
    this.wsService.socket.emit('join-channel', channel._id);
  }

  createChannel() {
    const channel: CreateChannelRequest = {
      server_id: this.currentServer._id,
      name: this.newChannelName,
    };
    this.wsService.socket.emit('create-channel', channel);
  }
}
