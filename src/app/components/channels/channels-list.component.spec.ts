import { async, ComponentFixture, TestBed, getTestBed } from '@angular/core/testing';
import { StoreModule, Store } from '@ngrx/store';
import { reducers } from '../../reducers/reducers';
import { AppState } from '../../reducers/app.states';
import { ChannelsListComponent } from './channels-list.component';
import { FormsModule } from '@angular/forms';
import { WebsocketService } from '../../services/websocket.service';
import { ErrorService } from '../../services/error.service';
import ChatServer from 'shared-interfaces/server.interface';
import { SettingsService } from '../../services/settings.service';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { ChannelSettingsService } from '../../services/channel-settings.service';

describe('ChannelsListComponent', () => {
  let component: ChannelsListComponent;
  let fixture: ComponentFixture<ChannelsListComponent>;
  let injector: TestBed;
  let store: Store<AppState>;
  let router: Router;

  const fakeWebSocketService = {
    socket: {
      emit: jasmine.createSpy(),
    },
  };

  const currentServer: ChatServer = {
    _id: '123',
    name: 'server',
    owner_id: 'asd',
  };

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const fakeChannelSettings: { channelsVisited: { [key: string]: Date } } = {
    channelsVisited: {
      visitedTomorrow: tomorrow,
      visitedYesterday: yesterday,
    },
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ChannelsListComponent],
      imports: [
        FormsModule,
        StoreModule.forRoot(reducers),
        RouterTestingModule,
      ],
      providers: [
        SettingsService,
        { provide: ChannelSettingsService, useValue: fakeChannelSettings },
        ErrorService,
        { provide: WebsocketService, useValue: fakeWebSocketService },
      ],
    })
      .compileComponents();
    injector = getTestBed();
    store = injector.get(Store);
    router = injector.get(Router);
    spyOn(store, 'dispatch').and.callThrough();
    spyOn(router, 'navigate');
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChannelsListComponent);
    component = fixture.componentInstance;
    component.currentServer = currentServer;
    fixture.detectChanges();
  });

  afterEach(() => {
    fakeWebSocketService.socket.emit.calls.reset();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('creates a new channel', () => {
    component.newChannelName = 'channel-name';
    component.createChannel();
    expect(fakeWebSocketService.socket.emit)
      .toHaveBeenCalledTimes(1);
    expect(fakeWebSocketService.socket.emit)
      .toHaveBeenCalledWith('create-channel', {
        server_id: '123',
        name: 'channel-name',
      });
  });
  it('should join a channel channel', () => {
    const chan = {
      name: 'name',
      _id: '123',
      server_id: '345',
      last_message: new Date(),
    };
    component.joinChannel(chan);
    expect(router.navigate)
      .toHaveBeenCalledWith([`channels/${chan.server_id}/${chan._id}`]);
  });
 it('has unread messages if channel checked before last_message', () => {
    const now = new Date();
    const past = new Date();
    past.setHours(now.getHours() - 1);

    component.currentServer.channelList = {
      server_id: '123',
        channels: [
          { name: 'asd', _id: 'visitedYesterday', last_message: now },
        ],
    };
    expect(component.channelHasUnreadMessages(component.currentServer.channelList.channels[0]))
      .toEqual(true);
  });
  it('does not have unread messages if channel._id is currentChannel._id', () => {
    const now = new Date();
    const past = new Date();
    past.setHours(now.getHours() - 1);

    component.currentServer.channelList = {
      server_id: '123',
      channels: [
        { name: 'asd', _id: 'visitedYesterday', last_message: now },
      ],
    };
    component.currentChatChannel = { name: 'asd', _id: 'visitedYesterday' };

    expect(component.channelHasUnreadMessages(component.currentServer.channelList.channels[0]))
      .toEqual(false);
  });
  it('does not have unread messages if channel checked after last_message', () => {
    const now = new Date();
    const past = new Date();
    past.setHours(now.getHours() - 1);

    component.currentServer.channelList = {
      server_id: '123',
      channels: [
        { name: 'asd', _id: 'visitedTomorrow', last_message: now },
      ],
    };
    expect(component.channelHasUnreadMessages(component.currentServer.channelList.channels[0]))
      .toEqual(false);
  });
});
