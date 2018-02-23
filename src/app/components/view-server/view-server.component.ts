import { Component, OnInit } from '@angular/core';
import { SettingsService } from '../../services/settings.service';
import ChatServer, { UserListUser } from 'shared-interfaces/server.interface';
import { Observable } from 'rxjs/Observable';
import { AppState } from '../../reducers/app.states';
import { ActivatedRoute } from '@angular/router';
import { WebsocketService } from '../../services/websocket.service';
import { Store } from '@ngrx/store';
import { LEAVE_CHANNEL } from '../../reducers/current-chat-channel.reducer';
import { ChatChannel } from 'shared-interfaces/channel.interface';
import { SET_CURRENT_SERVER } from '../../reducers/current-server.reducer';
@Component({
  selector: 'app-view-server',
  templateUrl: './view-server.component.html',
  styleUrls: ['./view-server.component.scss']
})
export class ViewServerComponent implements OnInit {
  public currentServer: Observable<ChatServer>;
  public currentChatChannel: Observable<ChatChannel>;

  constructor(
    public settingsService: SettingsService,
    private store: Store<AppState>,
    private route: ActivatedRoute,
    private wsService: WebsocketService,
  ) {
    const id = this.route.snapshot.paramMap.get('id');
    this.route.data
      .subscribe((data) => {
        this.currentServer = data.state.server;
        this.currentChatChannel = data.state.channel;
      });
  }

  ngOnInit() {
  }

}
