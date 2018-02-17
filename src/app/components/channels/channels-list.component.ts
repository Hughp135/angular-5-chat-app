import { Component, OnInit } from '@angular/core';
import { Channel } from 'shared-interfaces/channel.interface';
import { WebsocketService } from '../../services/websocket.service';
import { CreateChannelRequest } from 'shared-interfaces/channel.interface';
import { Store } from '@ngrx/store';
import { AppState, Server } from '../../reducers/app.states';
import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'app-channels-list',
  templateUrl: './channels-list.component.html',
  styleUrls: ['./channels-list.component.scss']
})
export class ChannelsListComponent implements OnInit {
  public newChannelName: string;
  public currentServer: Observable<Server>;

  constructor(
    private wsService: WebsocketService,
    private store: Store<AppState>
  ) {
    this.currentServer = this.store.select(state => state.currentServer);
  }

  ngOnInit() {
  }

  joinChannel(channel: Channel) {
    // this.appState.currentChatChannel = channel;
    this.wsService.socket.emit('join-channel', channel._id);
  }

  createChannel() {
    this.currentServer
      .subscribe(server => {
        const channel: CreateChannelRequest = {
          server_id: server._id,
          name: this.newChannelName,
        };
        this.wsService.socket.emit('create-channel', channel);
      });
  }
}
