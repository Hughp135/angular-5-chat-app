import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FriendsComponent } from './friends.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { SettingsService } from '../../services/settings.service';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute, Router } from '@angular/router';
import ChatServer from 'shared-interfaces/server.interface';
import { ChatChannel } from 'shared-interfaces/channel.interface';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import { FriendsStore } from '../../reducers/friends-reducer';

describe('FriendsComponent', () => {
  let component: FriendsComponent;
  let fixture: ComponentFixture<FriendsComponent>;
  let router: Router;

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
        '345': { username: 'user345' }
      },
      channels: [channel]
    }
  };
  const friends: FriendsStore = {
    friendRequests: [
      { type: 'incoming', user_id: 'ab1', _id: 'lo1' }
    ]
  };

  const route = {
    data: Observable.of({
      state: {
        channel: Observable.of(channel),
        server: Observable.of(server),
        friends: Observable.of(friends),
      }
    })
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [FriendsComponent],
      schemas: [NO_ERRORS_SCHEMA],
      imports: [
        RouterTestingModule,
      ],
      providers: [
        { provide: ActivatedRoute, useValue: route },
        SettingsService,
      ],
    })
      .compileComponents();
    router = TestBed.get(Router);
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FriendsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    spyOn(router, 'navigate');
  });

  it('should create + initial state', () => {
    expect(component).toBeTruthy();
    expect(component.currentServer).toBeTruthy();
    expect(component.currentChatChannel).toBeTruthy();
    expect(component.friendsStore).toBeTruthy();
  });
  it('join server should redirect', () => {
    component.joinChannel(channel);
    expect(router.navigate)
      .toHaveBeenCalledWith([`friends/${channel._id}`]);
  });
  it('getChannelName returns correct channel name', () => {
    expect(component.getChannelName(channel)).toEqual('user345');
  });
  it('getChannelName returns unknown if user id not found', () => {
    const channel1 = {
      ...channel,
      user_ids: ['asd', 'bcd']
    };
    expect(component.getChannelName(channel1)).toEqual('Unknown');
  });
});
