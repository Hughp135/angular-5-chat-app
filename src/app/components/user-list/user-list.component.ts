import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState } from '../../reducers/app.states';
import ChatServer, { UserListUser } from '../../../../shared-interfaces/server.interface';
import { Observable } from 'rxjs/Observable';
import { SettingsService } from '../../services/settings.service';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/filter';
import { OnDestroy } from '@angular/core/src/metadata/lifecycle_hooks';
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss']
})
export class UserListComponent implements OnInit, OnDestroy {
  currentServer: Observable<ChatServer>;
  public onlineUsers: UserListUser[];
  public offlineUsers: UserListUser[];
  public subscriptions: Subscription[] = [];

  constructor(
    public store: Store<AppState>,
    public settingsService: SettingsService,
  ) {
    this.currentServer = store.select(state => state.currentServer);
    this.subscriptions.push(this.currentServer
      .subscribe(data => {
        this.onlineUsers = data.userList &&
          data.userList.users.filter(usr => usr.online);
        this.offlineUsers = data.userList &&
          data.userList.users.filter(usr => !usr.online);
      }));
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}
