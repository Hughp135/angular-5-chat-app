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
import { Observable } from 'rxjs/Observable';
import { ApiService } from '../../services/api.service';
import { SuiModalService, SuiComponentFactory } from 'ng2-semantic-ui/dist';

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

  const fakeModalService = {
    open: () => ({
      onApprove: (cb) => cb(),
    }),
  };

  const apiServiceMock = {
    delete: jasmine.createSpy().and.callFake(url => {
      if (url === 'delete-channel/123') {
        return Observable.of({ channels: [] });
      } else if (url === 'delete-channel/withlist') {
        return Observable.of({ channels: [{ _id: '123' }] });
      } else if (url === 'delete-channel/401') {
        return Observable.throw({ status: 401 });
      } else if (url === 'delete-channel/500') {
        return Observable.throw({ status: 500 });
      }
    }),
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
        { provide: ApiService, useValue: apiServiceMock },
        { provide: SuiModalService, useValue: fakeModalService },
        SuiComponentFactory,
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
    component.me = {
      username: 'tstuser',
      _id: '123',
    };
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
      voiceChannels: [],
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
      voiceChannels: [],
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
      voiceChannels: [],
    };
    expect(component.channelHasUnreadMessages(component.currentServer.channelList.channels[0]))
      .toEqual(false);
  });
  it('has unread messages if channel has not been visited', () => {
    const now = new Date();
    now.setHours(now.getHours() + 1); // into the future for lols
    component.currentServer.channelList = {
      server_id: '123',
      channels: [
        { name: 'asd', _id: 'notvisited', last_message: now },
      ],
      voiceChannels: [],
    };
    expect(component.channelHasUnreadMessages(component.currentServer.channelList.channels[0]))
      .toEqual(true);
  });
  it('delete channel emits delete-channel', () => {
    component.deleteChannel('123');
    expect(fakeWebSocketService.socket.emit)
      .toHaveBeenCalledWith('delete-channel', '123');
  });
  it('delete voice channel emits delete-voice-channel', () => {
    component.deleteVoiceChannel('123');
    expect(fakeWebSocketService.socket.emit)
      .toHaveBeenCalledWith('delete-voice-channel', '123');
  });
  it('deletes channel shows permission error if 401', async (done) => {
    component.deleteChannel('401');
    await new Promise(res => setTimeout(res, 5));
    expect(router.navigate).not.toHaveBeenCalled();
    expect(store.dispatch).not.toHaveBeenCalled();

    done();
  });
  it('deletes channel shows permission error if other error', async (done) => {
    component.deleteChannel('500');
    await new Promise(res => setTimeout(res, 5));
    expect(router.navigate).not.toHaveBeenCalled();
    expect(store.dispatch).not.toHaveBeenCalled();

    done();
  });
  it('toggles show create channel and focuses input', async (done) => {
    component.textChannelInput = {
      nativeElement: {
        focus: jasmine.createSpy(),
      },
    };
    component.showCreateTextChannel();
    expect(component.showNewChannelInput).toEqual(true);
    await new Promise(res => setTimeout(res, 51));
    expect(component.textChannelInput.nativeElement.focus).toHaveBeenCalled();
    done();
  });
  it('toggles show create voice channel and focuses input', async (done) => {
    component.voiceChannelInput = {
      nativeElement: {
        focus: jasmine.createSpy(),
      },
    };
    component.showCreateVoiceChannel();
    expect(component.showVoiceChannelInput).toEqual(true);
    await new Promise(res => setTimeout(res, 51));
    expect(component.voiceChannelInput.nativeElement.focus).toHaveBeenCalled();
    done();
  });
  it('pressing escape key on input resets input and hides', () => {
    component.showNewChannelInput = true;
    component.newChannelName = 'testname';
    component.newChannelInputKeypress({
      key: 'Escape',
    });
    expect(component.showNewChannelInput).toEqual(false);
    expect(component.newChannelName).toEqual('');
  });
  it('pressing any other key on input does nothing', () => {
    component.showNewChannelInput = true;
    component.newChannelName = 'testname';
    component.newChannelInputKeypress({
      key: 'something',
    });
    expect(component.showNewChannelInput).toEqual(true);
    expect(component.newChannelName).toEqual('testname');
  });
  it('pressing escape key on voice input resets input and hides', () => {
    component.showVoiceChannelInput = true;
    component.voiceChannelName = 'testname';
    component.voiceChannelInputKeypress({
      key: 'Escape',
    });
    expect(component.showVoiceChannelInput).toEqual(false);
    expect(component.voiceChannelName).toEqual('');
  });
  it('pressing any other key on voice input does nothing', () => {
    component.showVoiceChannelInput = true;
    component.voiceChannelName = 'testname';
    component.voiceChannelInputKeypress({
      key: 'something',
    });
    expect(component.showVoiceChannelInput).toEqual(true);
    expect(component.voiceChannelName).toEqual('testname');
  });
  it('joining voice channel emits join-voice-channel', () => {
    component.joinVoiceChannel({ _id: '123', name: 'chan1', users: [] });
    expect(fakeWebSocketService.socket.emit)
      .toHaveBeenCalledWith('join-voice-channel', '123');
  });
});
