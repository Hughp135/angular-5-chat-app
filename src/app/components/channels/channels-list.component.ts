import { Component, OnInit } from '@angular/core';
import { ChatChannel } from 'shared-interfaces/channel.interface';
import { WebsocketService } from '../../services/websocket.service';
import { CreateChannelRequest } from 'shared-interfaces/channel.interface';
import { Store } from '@ngrx/store';
import { AppState } from '../../reducers/app.states';
import { Observable } from 'rxjs/Observable';
import { JOIN_CHANNEL } from '../../reducers/current-chat-channel.reducer';
import ChatServer from '../../../../shared-interfaces/server.interface';
import { AppStateService } from '../../services/app-state.service';

@Component({
  selector: 'app-channels-list',
  templateUrl: './channels-list.component.html',
  styleUrls: ['./channels-list.component.scss']
})
export class ChannelsListComponent implements OnInit {
  public newChannelName: string;
  public currentServer: Observable<ChatServer>;

  constructor(
    private wsService: WebsocketService,
    private store: Store<AppState>,
    private appState: AppStateService
  ) {
    this.currentServer = this.store.select(state => state.currentServer);
  }

  ngOnInit() {
  }

  joinChannel(channel: ChatChannel) {
    this.store.dispatch({
      type: JOIN_CHANNEL,
      payload: channel
    });
    this.wsService.socket.emit('join-channel', channel._id);
  }

  createChannel() {
    const currentServer = this.appState.currentServer;
    const channel: CreateChannelRequest = {
      server_id: currentServer._id,
      name: this.newChannelName,
    };
    this.wsService.socket.emit('create-channel', channel);
  }
}
