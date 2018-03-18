import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FriendsComponent } from './friends.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { SettingsService } from '../../services/settings.service';
import { ActivatedRoute } from '@angular/router';
import ChatServer from 'shared-interfaces/server.interface';
import { ChatChannel } from 'shared-interfaces/channel.interface';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import { FriendsStore } from '../../reducers/friends-reducer';

describe('FriendsComponent', () => {
  let component: FriendsComponent;
  let fixture: ComponentFixture<FriendsComponent>;


  const channel: ChatChannel = {
    name: 'name',
    _id: '123',
    server_id: '345',
    user_ids: ['123', '345'],
  };
  const server: ChatServer = {
    name: 'Friendserver test',
    _id: 'friends',
    channelList: {
      server_id: 'friends',
      users: {
        '345': { username: 'user345' },
      },
      channels: [{ name: channel.name, _id: channel._id, server_id: channel.server_id }],
    },
  };
  const friends: FriendsStore = {
    friendRequests: [
      { type: 'incoming', user_id: 'ab1', _id: 'lo1' },
    ],
  };

  const route = {
    data: Observable.of({
      state: {
        channel: Observable.of(channel),
        server: Observable.of(server),
        friends: Observable.of(friends),
      },
    }),
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [FriendsComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: ActivatedRoute, useValue: route },
        SettingsService,
      ],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FriendsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create + initial state', () => {
    expect(component).toBeTruthy();
    expect(component.currentServer).toBeTruthy();
    expect(component.currentChatChannel).toBeTruthy();
  });

});
