import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { StoreModule, Store } from '@ngrx/store';
import { AppState } from '../../reducers/app.states';
import { reducers } from '../../reducers/reducers';

import { UserListComponent } from './user-list.component';
import { SettingsService } from '../../services/settings.service';
import { SET_CURRENT_SERVER } from '../../reducers/current-server.reducer';
import ChatServer from 'shared-interfaces/server.interface';
import { WebsocketService } from '../../services/websocket.service';
import { ShContextMenuModule } from 'ng2-right-click-menu';

const fakeSocket = {
  emit: jasmine.createSpy(),
  connected: true,
};
const fakeSocketService = {
  socket: fakeSocket,
};

describe('UserListComponent', () => {
  let component: UserListComponent;
  let fixture: ComponentFixture<UserListComponent>;
  let store: Store<AppState>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [UserListComponent],
      imports: [StoreModule.forRoot(reducers), ShContextMenuModule],
      providers: [
        SettingsService,
        { provide: WebsocketService, useValue: fakeSocketService },
      ]
    })
      .compileComponents();
    store = TestBed.get(Store);
    const currentServer: ChatServer = {
      _id: '123',
      name: 'server',
      owner_id: 'asd',
      userList: [
        { username: 'someusr', _id: '1aad', online: true },
        { username: 'someusr2', _id: '2aad', online: false },
      ]
    };
    store.dispatch({
      type: SET_CURRENT_SERVER,
      payload: currentServer,
    });
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    fakeSocket.emit.calls.reset();
  });

  it('initial state', (done) => {
    expect(component).toBeTruthy();
    expect(component.userList).toEqual([
      { username: 'someusr', _id: '1aad', online: true },
      { username: 'someusr2', _id: '2aad', online: false },
    ]);
    setTimeout(() => {
      expect(component.onlineUsers).toEqual([{ username: 'someusr', _id: '1aad', online: true }]);
      expect(component.offlineUsers).toEqual([{ username: 'someusr2', _id: '2aad', online: false }]);
      expect(component.subscriptions.length).toEqual(4);
      expect(component.menuItems).toBeDefined();
      done();
    }, 20);
  });
  it('user lists are reset if new server joined', (done) => {
    expect(component.userList).toEqual([
      { username: 'someusr', _id: '1aad', online: true },
      { username: 'someusr2', _id: '2aad', online: false },
    ]);
    setTimeout(() => {
      expect(component.onlineUsers).toEqual([{ username: 'someusr', _id: '1aad', online: true }]);
      expect(component.offlineUsers).toEqual([{ username: 'someusr2', _id: '2aad', online: false }]);
      expect(component.subscriptions.length).toEqual(4);
      const newServer: ChatServer = {
        _id: '0fus',
        name: 'newserver',
        owner_id: 'fago',
      };
      store.dispatch({
        type: SET_CURRENT_SERVER,
        payload: newServer
      });
      setTimeout(() => {
        expect(component.userList).toBeUndefined();
        expect(component.onlineUsers).toBeUndefined();
        expect(component.offlineUsers).toBeUndefined();
        done();
      }, 50);
    }, 20);
  });
  it('fetch user list', () => {
    component.fetchUserList();
    expect(fakeSocket.emit).toHaveBeenCalledWith('get-user-list', '123');
  });
  it('does not fetch user list if socket disconnected', () => {
    component.wsService.socket.connected = false;
    component.fetchUserList();
    expect(fakeSocket.emit).not.toHaveBeenCalled();
  });
  it('does not fetch user list if no current server', () => {
    component.currentServer = undefined;
    component.fetchUserList();
    expect(fakeSocket.emit).not.toHaveBeenCalled();
  });
  it('userList track by', () => {
    expect(component.userListTrackBy(null, { _id: true })).toEqual(true);
  });
  it('mouse enter userlist', () => {
    component.onMouseEnter(true);
    expect(component.preventListUpdate).toEqual(true);
    component.onMouseEnter(false);
    expect(component.preventListUpdate).toEqual(false);
  });
});
