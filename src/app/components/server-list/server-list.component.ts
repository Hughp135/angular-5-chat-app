import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { SettingsService } from '../../services/settings.service';
import { WebsocketService } from '../../services/websocket.service';
import ChatServer from 'shared-interfaces/server.interface';
import { Store } from '@ngrx/store';
import { AppState } from '../../reducers/app.states';
import { UPDATE_SERVER_LIST } from '../../reducers/server-list.reducer';
import { Observable } from 'rxjs/Observable';
import { LEAVE_CHANNEL } from '../../reducers/current-chat-channel.reducer';
import { Router } from '@angular/router';

@Component({
  selector: 'app-server-list',
  templateUrl: './server-list.component.html',
  styleUrls: ['./server-list.component.scss']
})
export class ServerListComponent implements OnInit {
  public serverList: Observable<ChatServer[]>;
  public currentServer: Observable<ChatServer>;

  constructor(
    private apiService: ApiService,
    public settingsService: SettingsService,
    private wsService: WebsocketService,
    private store: Store<AppState>,
    private router: Router,
  ) {
    this.serverList = this.store.select('serverList');
    this.currentServer = this.store.select('currentServer');

  }

  joinServer(server: ChatServer) {
    this.router.navigate([`channels/${server._id}`]);
  }

  ngOnInit() {
  }

}
