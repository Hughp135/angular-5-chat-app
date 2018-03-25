import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ServerResolver } from './server-resolver.service';
import ChatServer from 'shared-interfaces/server.interface';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { StoreModule, Store } from '@ngrx/store';
import { AppState } from '../reducers/app.states';
import { reducers } from '../reducers/reducers';
import { WebsocketService } from '../services/websocket.service';
import { UPDATE_SERVER_LIST } from '../reducers/server-list.reducer';
import { LEAVE_CHANNEL } from '../reducers/current-chat-channel.reducer';
import { SET_CURRENT_SERVER, SET_CHANNEL_LIST } from '../reducers/current-server.reducer';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { ChannelList } from '../../../shared-interfaces/channel.interface';
import { ErrorService } from '../services/error.service';

const serverList: ChatServer[] = [
  { name: 'server1', _id: '123', owner_id: '345' },
];

const fakeWebSocketService = {
  socket: {
    emit: jasmine.createSpy(),
  },
};

describe('ServerResolver.Service.TsService', () => {
  let store: Store<AppState>;
  let service: ServerResolver;
  let route;
  let router: Router;
  let errorService: ErrorService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ServerResolver,
        { provide: WebsocketService, useValue: fakeWebSocketService },
        ErrorService,
      ],
      imports: [
        HttpClientTestingModule,
        StoreModule.forRoot(reducers),
        RouterTestingModule,
      ],
    });

    store = TestBed.get(Store);
    service = TestBed.get(ServerResolver);
    router = TestBed.get(Router);
    errorService = TestBed.get(ErrorService);
    spyOn(router, 'navigate');
    spyOn(errorService.errorMessage, 'next');
    store.dispatch({
      type: UPDATE_SERVER_LIST,
      payload: serverList,
    });
    route = {
      paramMap: {
        get: () => '123',
      },
      children: [{}],
    };
    spyOn(store, 'dispatch').and.callThrough();
  });

  afterEach(() => {
    fakeWebSocketService.socket.emit.calls.reset();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
  it('joinServer leaves channel, sets current server and emits join-server', async () => {
    await service.joinServer(serverList[0]._id);
    expect(store.dispatch).toHaveBeenCalledWith({
      type: LEAVE_CHANNEL,
      payload: null,
    });
    expect(store.dispatch).toHaveBeenCalledWith({
      type: SET_CURRENT_SERVER,
      payload: serverList[0],
    });
    expect(fakeWebSocketService.socket.emit)
      .toHaveBeenCalledWith('join-server', serverList[0]._id);
  });
  it('resolves with correct data', async () => {
    const result = await service.resolve(<any>route, null);
    expect(result.server).toBeTruthy();
    expect(result.channel).toBeTruthy();
  });

  it('navigates to 1st channel if not in a channel', fakeAsync(async () => {
    route.children = [];
    const channelList: ChannelList = {
      server_id: serverList[0]._id,
      channels: [
        { name: 'chan1', _id: 'sdf9', server_id: serverList[0]._id, last_message: new Date() },
      ],
    };

    service.resolve(<any>route, null);
    tick(10);
    store.dispatch({
      type: SET_CHANNEL_LIST,
      payload: channelList,
    });
    tick(10);

    expect(router.navigate)
      .toHaveBeenCalledWith([`/channels/${serverList[0]._id}/${channelList.channels[0]._id}`]);
  }));
  it('navigates to server if not in a channel and no channel list', fakeAsync(async () => {
    route.children = [];
    const channelList: ChannelList = {
      server_id: serverList[0]._id,
      channels: [],
    };

    service.resolve(<any>route, null);
    tick(10);
    store.dispatch({
      type: SET_CHANNEL_LIST,
      payload: channelList,
    });
    tick(10);

    expect(router.navigate)
      .toHaveBeenCalledWith([`/channels/${serverList[0]._id}`]);
  }));
  it('shows error & redirects to home if server not found', fakeAsync(() => {
    store.dispatch({
      type: UPDATE_SERVER_LIST,
      payload: [],
    });
    service.resolve(<any>route, null);
    tick(10);
    expect(errorService.errorMessage.next).toHaveBeenCalled();
    expect(router.navigate)
      .toHaveBeenCalledWith([``]);
  }));
});
