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
import { OnDestroy, AfterViewInit } from '@angular/core/src/metadata/lifecycle_hooks';
import { Subscription } from 'rxjs/Subscription';
import { WebsocketService } from '../../services/websocket.service';
import { IShContextMenuItem } from 'ng2-right-click-menu/sh-context-menu.models';
import { ChangeDetectorRef } from '@angular/core';
@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss']
})
export class UserListComponent implements OnInit, OnDestroy, AfterViewInit {
  public currentServer: ChatServer;
  public userList: UserListUser[];
  public onlineUsers: UserListUser[];
  public offlineUsers: UserListUser[];
  public subscriptions: Subscription[] = [];
  public preventListUpdate = false;
  public menuItems: IShContextMenuItem[];

  constructor(
    public store: Store<AppState>,
    public settingsService: SettingsService,
    public wsService: WebsocketService,
    private ref: ChangeDetectorRef,
  ) {
    this.ref.detach();
    this.addContextMenuItems();
  }

  ngAfterViewInit() {
    const currentServerObs = this.store.select(state => state.currentServer);
    this.subscriptions.push(
      currentServerObs
        .distinctUntilChanged((a, b) => {
          return JSON.stringify(a) === JSON.stringify(b);
        })
        .subscribe(data => {
          this.currentServer = data;
        }),
      currentServerObs
        .map(server => server.userList)
        .distinctUntilChanged((a, b) => {
          return JSON.stringify(a) === JSON.stringify(b);
        })
        .subscribe(userList => {
          this.userList = userList;
          this.updateUserLists();
        }),
      Observable.timer(250, 2000)
        .subscribe(() => {
          // Update filtered lists (short timer)
          /* istanbul ignore next */
          if (!this.preventListUpdate) {
            this.ref.detectChanges();
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

  updateUserLists() {
    this.onlineUsers = this.userList &&
      this.userList.filter(usr => usr.online)
        .sort(sortAlphabetically);
    this.offlineUsers = this.userList &&
      this.userList.filter(usr => !usr.online)
        .sort(sortAlphabetically);
    if (!this.userList) {
      this.ref.detectChanges();
    }
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

  addContextMenuItems() {
    this.menuItems = [
      {
        label: 'User'
      }
    ];
  }

  onMouseEnter(enter: boolean) {
    this.preventListUpdate = enter && this.userList !== undefined;
  }
}

/* istanbul ignore next */
function sortAlphabetically(a: UserListUser, b: UserListUser) {
  return a.username > b.username ? -1
    : a.username < b.username ? 1
      : 0; // sort list alphabetically
}
