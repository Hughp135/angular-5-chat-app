import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserListComponent } from './user-list.component';
import { SettingsService } from '../../services/settings.service';
import ChatServer from 'shared-interfaces/server.interface';
import { WebsocketService } from '../../services/websocket.service';
import { ShContextMenuModule } from 'ng2-right-click-menu';
import { RouterTestingModule } from '@angular/router/testing';
import { DirectMessageService } from '../../services/direct-message.service';

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
  const fakeDmService = {
    startPm: jasmine.createSpy()
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [UserListComponent],
      imports: [
        ShContextMenuModule,
        RouterTestingModule
      ],
      providers: [
        SettingsService,
        { provide: WebsocketService, useValue: fakeSocketService },
        { provide: DirectMessageService, useValue: fakeDmService },
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserListComponent);
    component = fixture.componentInstance;
    component.currentServer = {
      _id: '123',
      name: 'server',
      owner_id: 'asd',
      userList: [
        { username: 'someusr', _id: '1aad', online: true },
        { username: 'someusr2', _id: '2aad', online: false },
      ]
    };
    fixture.detectChanges();
  });

  afterEach(() => {
    fakeSocket.emit.calls.reset();
    fakeDmService.startPm.calls.reset();
  });

  it('initial state', () => {
    expect(component).toBeTruthy();
    expect(component.userList).toEqual([
      { username: 'someusr', _id: '1aad', online: true },
      { username: 'someusr2', _id: '2aad', online: false },
    ]);
    expect(component.onlineUsers).toEqual([{ username: 'someusr', _id: '1aad', online: true }]);
    expect(component.offlineUsers).toEqual([{ username: 'someusr2', _id: '2aad', online: false }]);
    expect(component.subscriptions.length).toEqual(2);
    expect(component.menuItems).toBeDefined();
  });
  it('user lists are reset if new server joined', () => {
    const newServer: ChatServer = {
      _id: '0fus',
      name: 'newserver',
      owner_id: 'fago',
    };
    component.currentServer = newServer;
    expect(component.userList).toBeUndefined();
    expect(component.onlineUsers).toBeUndefined();
    expect(component.offlineUsers).toBeUndefined();
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
  it('openDm calls dmService.startPm', () => {
    component.sendUserMessage('123');
    expect(fakeDmService.startPm).toHaveBeenCalledWith('123');
  });
});
