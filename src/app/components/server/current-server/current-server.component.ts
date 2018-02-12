import { Component, OnInit } from '@angular/core';
import { WebsocketService } from '../../../services/websocket.service';
import { AppStateService } from '../../../services/app-state.service';
import { Channel } from 'shared-interfaces/channel.interface';

@Component({
  selector: 'app-current-server',
  templateUrl: './current-server.component.html',
  styleUrls: ['./current-server.component.scss']
})
export class CurrentServerComponent implements OnInit {
  public newChannelName: string;

  constructor(
    private wsService: WebsocketService,
    public appState: AppStateService,
  ) { }

  ngOnInit() {
  }

  createChannel() {
    const channel: Channel = {
      server_id: this.appState.currentServer._id,
      name: this.newChannelName,
    };
    this.wsService.socket.emit('create-channel', channel);
  }
}
