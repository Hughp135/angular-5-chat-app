import { Component, OnInit } from '@angular/core';
import { WebsocketService } from '../../../services/websocket.service';
import { AppStateService } from '../../../services/app-state.service';

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
    // console.log('creating channel ', this.newChannelName, 'serverId:', this.appState.currentServer._id);
    // this.wsService.socket.emit('create-channel', {
    //   server_id: this.appState.currentServer._id,
    //   channel_name: this.newChannelName,
    // });
  }
}
