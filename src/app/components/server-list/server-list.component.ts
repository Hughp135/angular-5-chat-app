import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { SettingsService } from '../../services/settings.service';
import { WebsocketService } from '../../services/websocket.service';
import ChatServer from '../../../../shared-interfaces/server.interface';
import { AppStateService } from '../../services/app-state.service';

@Component({
  selector: 'app-server-list',
  templateUrl: './server-list.component.html',
  styleUrls: ['./server-list.component.scss']
})
export class ServerListComponent implements OnInit {
  public serverList;
  public loading = false;
  public error: string;

  constructor(
    private apiService: ApiService,
    public settingsService: SettingsService,
    private wsService: WebsocketService,
    private appState: AppStateService,
  ) {
    this.loading = true;
    this.error = null;
    this.apiService
      .get('server')
      .finally(() => this.onGetServersComplete())
      .subscribe((data: any) => {
        this.serverList = data.servers;
      }, e => this.onGetServersComplete(e));
  }

  onGetServersComplete(e?) {
    this.loading = false;

    if (e) {
      this.error = 'Unable to retrieve server list.';
      return;
    }
  }

  joinServer(server: ChatServer) {
    this.appState.currentServer = server;
    this.wsService.socket.emit('join-server', server.id);
  }

  ngOnInit() {
  }

}
