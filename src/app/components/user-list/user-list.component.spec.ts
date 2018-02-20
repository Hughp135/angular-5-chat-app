import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { StoreModule, Store } from '@ngrx/store';
import { AppState } from '../../reducers/app.states';
import { reducers } from '../../reducers/reducers';

import { UserListComponent } from './user-list.component';
import { SettingsService } from '../../services/settings.service';
import { JOIN_SERVER } from '../../reducers/current-server.reducer';
import ChatServer from 'shared-interfaces/server.interface';
import { WebsocketService } from '../../services/websocket.service';

describe('UserListComponent', () => {
  let component: UserListComponent;
  let fixture: ComponentFixture<UserListComponent>;
  let store: Store<AppState>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [UserListComponent],
      imports: [StoreModule.forRoot(reducers)],
      providers: [
        SettingsService,
        { provide: WebsocketService, useValue: { emit: () => null } },
      ]
    })
      .compileComponents();
    store = TestBed.get(Store);
    const currentServer: ChatServer = {
      _id: '123',
      name: 'server',
      owner_id: 'asd',
      userList: {
        server_id: '123',
        users: [
          { username: 'someusr', _id: '1aad', online: true },
          { username: 'someusr2', _id: '2aad', online: false },
        ]
      }
    };
    store.dispatch({
      type: JOIN_SERVER,
      payload: currentServer,
    });
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('initial state', (done) => {
    expect(component).toBeTruthy();
    fixture.detectChanges();
    expect(component.userList).toEqual([
      { username: 'someusr', _id: '1aad', online: true },
      { username: 'someusr2', _id: '2aad', online: false },
    ]);
    setTimeout(() => {
      expect(component.onlineUsers).toEqual([{ username: 'someusr', _id: '1aad', online: true }]);
      expect(component.offlineUsers).toEqual([{ username: 'someusr2', _id: '2aad', online: false }]);
      done();
    }, 250);
  });
});
