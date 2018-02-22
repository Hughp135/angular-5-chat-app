import { Component, OnInit } from '@angular/core';
import { SettingsService } from '../../services/settings.service';
import ChatServer from 'shared-interfaces/server.interface';
import { Observable } from 'rxjs/Observable';
import { Store } from '@ngrx/store';
import { AppState } from '../../reducers/app.states';
import { ActivatedRoute } from '@angular/router';
import { WebsocketService } from '../../services/websocket.service';
import { Store } from '@ngrx/store';
import { LEAVE_CHANNEL } from '../../reducers/current-chat-channel.reducer';
import { JOIN_SERVER } from '../../reducers/current-server.reducer';

@Component({
  selector: 'app-view-server',
  templateUrl: './view-server.component.html',
  styleUrls: ['./view-server.component.scss']
})
export class ViewServerComponent implements OnInit {
  public currentServer: Observable<ChatServer>;

  constructor(
    public settingsService: SettingsService,
    private store: Store<AppState>,
    private route: ActivatedRoute,
    private wsService: WebsocketService,
  ) {
    const id = this.route.snapshot.paramMap.get('id');
    const currentServer = this.store
      .select(state => state.serverList)
      .filter(data => data.length > 0)
      .take(1)
      .subscribe(data => console.log('got server list', data));
    this.store.dispatch({
      type: LEAVE_CHANNEL,
      payload: null,
    });
    this.store.dispatch({
      type: JOIN_SERVER,
      payload: server,
    });
    this.wsService.socket.emit('join-server', server._id);
  }

  ngOnInit() {
  }

}
