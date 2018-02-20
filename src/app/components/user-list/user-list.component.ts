import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState } from '../../reducers/app.states';
import ChatServer, { UserListUser } from '../../../../shared-interfaces/server.interface';
import { Observable } from 'rxjs/Observable';
import { SettingsService } from '../../services/settings.service';
import 'rxjs/add/observable/timer';
import 'rxjs/add/observable/interval';
import { OnDestroy } from '@angular/core/src/metadata/lifecycle_hooks';
import { Subscription } from 'rxjs/Subscription';
import { WebsocketService } from '../../services/websocket.service';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss']
})
export class UserListComponent implements OnInit, OnDestroy {
  private currentServer: ChatServer;
  public userList: UserListUser[];
  public onlineUsers: UserListUser[];
  public offlineUsers: UserListUser[];
  public subscriptions: Subscription[] = [];
  public preventListUpdate = false;

  constructor(
    public store: Store<AppState>,
    public settingsService: SettingsService,
    private wsService: WebsocketService,
  ) {
    const currentServerObs = store.select(state => state.currentServer);
    this.subscriptions.push(
      currentServerObs
        .subscribe(data => {
          this.currentServer = data;
          if (data.userList) {
            this.userList = data.userList.users;
          } else {
            this.onlineUsers = undefined;
            this.offlineUsers = undefined;
            this.userList = undefined;
          }
        }),
      Observable.timer(150, 5000)
        .subscribe(() => {
          if (!this.preventListUpdate) {
            this.onlineUsers = this.userList &&
              this.userList.filter(usr => usr.online);
            this.offlineUsers = this.userList &&
              this.userList.filter(usr => !usr.online);
          }
        }),
      Observable.interval(60000)
        .subscribe(() => {
          if (this.currentServer._id && this.wsService.socket.connected) {
            this.wsService.socket.emit('get-user-list', this.currentServer._id);
          }
        }),
    );

  }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  userListTrackBy(index, user) {
    return user._id;
  }
}
