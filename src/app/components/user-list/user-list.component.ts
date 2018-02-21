import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState } from '../../reducers/app.states';
import ChatServer, { UserListUser } from '../../../../shared-interfaces/server.interface';
import { Observable } from 'rxjs/Observable';
import { SettingsService } from '../../services/settings.service';
import 'rxjs/add/observable/timer';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/filter';
import 'rxjs/add/observable/interval';
import 'rxjs/add/operator/distinctUntilChanged';
import { OnDestroy } from '@angular/core/src/metadata/lifecycle_hooks';
import { Subscription } from 'rxjs/Subscription';
import { WebsocketService } from '../../services/websocket.service';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss']
})
export class UserListComponent implements OnInit, OnDestroy {
  public currentServer: ChatServer;
  public userList: UserListUser[];
  public onlineUsers: UserListUser[];
  public offlineUsers: UserListUser[];
  public subscriptions: Subscription[] = [];
  public preventListUpdate = false;

  constructor(
    public store: Store<AppState>,
    public settingsService: SettingsService,
    public wsService: WebsocketService,
  ) {
    const currentServerObs = store.select(state => state.currentServer);
    this.subscriptions.push(
      currentServerObs
        .subscribe(data => {
          this.currentServer = data;
        }),
      currentServerObs
        .map(server => server.userList)
        .distinctUntilChanged((a, b) => {
          return JSON.stringify(a) === JSON.stringify(b);
        })
        .subscribe(userList => {
          if (!userList) {
            // New server - reset lists
            this.onlineUsers = undefined;
            this.offlineUsers = undefined;
          }
          if (!this.userList) {
            // First user list received - save value & filter immediately
            this.userList = userList;
            this.filterUserList();
          } else {
            // User list changed
            this.userList = userList;
          }
        }),
      Observable.timer(250, 5000)
        .subscribe(() => {
          // Update filtered lists (short timer)
          /* istanbul ignore next */
          if (!this.preventListUpdate) {
            this.filterUserList();
          }
        }),
      Observable.interval(60000)
        .subscribe(() => {
          /* istanbul ignore next */
          // Request new user list (long timer)
          this.fetchUserList();
        }),
    );

  }

  filterUserList() {
    this.onlineUsers = this.userList &&
      this.userList.filter(usr => usr.online)
        .sort(sortAlphabetically);
    this.offlineUsers = this.userList &&
      this.userList.filter(usr => !usr.online)
        .sort(sortAlphabetically);
  }

  fetchUserList() {
    if (this.currentServer && this.wsService.socket.connected) {
      this.wsService.socket.emit('get-user-list', this.currentServer._id);
    }
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

/* istanbul ignore next */
function sortAlphabetically(a: UserListUser, b: UserListUser) {
  return a.username > b.username ? -1
    : a.username < b.username ? 1
      : 0; // sort list alphabetically
}
