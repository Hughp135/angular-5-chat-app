import { TestBed, inject } from '@angular/core/testing';

import { ServerResolver } from './server-resolver.service';
import ChatServer from 'shared-interfaces/server.interface';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { StoreModule, Store } from '@ngrx/store';
import { AppState } from '../reducers/app.states';
import { reducers } from '../reducers/reducers';
import { WebsocketService } from './websocket.service';
import { UPDATE_SERVER_LIST } from '../reducers/server-list.reducer';
import { LEAVE_CHANNEL } from '../reducers/current-chat-channel.reducer';
import { SET_CURRENT_SERVER } from '../reducers/current-server.reducer';
import { ActivatedRoute, ActivatedRouteSnapshot } from '@angular/router/src/router_state';

const serverList: ChatServer[] = [
  { name: 'server1', _id: '123', owner_id: '345' }
];

const fakeWebSocketService = {
  socket: {
    emit: jasmine.createSpy()
  }
};

const route = {
  paramMap: {
    get: () => '123'
  },
};

describe('ServerResolver.Service.TsService', () => {
  let httpMock: HttpTestingController;
  let store: Store<AppState>;
  let service: ServerResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ServerResolver,
        { provide: WebsocketService, useValue: fakeWebSocketService },
      ],
      imports: [
        HttpClientTestingModule,
        StoreModule.forRoot(reducers),
      ],
    });

    httpMock = TestBed.get(HttpTestingController);
    store = TestBed.get(Store);
    service = TestBed.get(ServerResolver);
    store.dispatch({
      type: UPDATE_SERVER_LIST,
      payload: serverList
    });
    spyOn(store, 'dispatch');
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
    store.dispatch({
      type: SET_CURRENT_SERVER,
      payload: serverList[0],
    });
    const result = await service.resolve(<any>route, null);
    expect(result.server).toBeTruthy();
    expect(result.channel).toBeTruthy();
  });
});
