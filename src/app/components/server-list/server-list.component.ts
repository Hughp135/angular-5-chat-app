import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { SettingsService } from '../../services/settings.service';
import { WebsocketService } from '../../services/websocket.service';
import ChatServer from 'shared-interfaces/server.interface';
import { Store } from '@ngrx/store';
import { AppState } from '../../reducers/app.states';
import { UPDATE_SERVER_LIST } from '../../reducers/server-list.reducer';
import Server from 'shared-interfaces/server.interface';
import { Observable } from 'rxjs/Observable';
import { JOIN_SERVER } from '../../reducers/current-server.reducer';

@Component({
  selector: 'app-server-list',
  templateUrl: './server-list.component.html',
  styleUrls: ['./server-list.component.scss']
})
export class ServerListComponent implements OnInit {
  public serverList: Observable<Server[]>;
  public loading = false;
  public error: string;

  constructor(
    private apiService: ApiService,
    public settingsService: SettingsService,
    private wsService: WebsocketService,
    private store: Store<AppState>
  ) {
    this.loading = true;
    this.error = null;
    this.serverList = this.store.select(state => state.serverList);
    this.apiService
      .get('servers')
      .finally(() => this.onGetServersComplete())
      .subscribe((data: { servers: Server[] }) => {
        this.store.dispatch({
          type: UPDATE_SERVER_LIST,
          payload: data.servers,
        });
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
    this.store.dispatch({
      type: JOIN_SERVER,
      payload: server,
    });
    this.wsService.socket.emit('join-server', server._id);
  }

  ngOnInit() {
  }

}
