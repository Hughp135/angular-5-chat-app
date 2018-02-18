import { TestBed, getTestBed } from '@angular/core/testing';

import { WebsocketService } from './websocket.service';
import { SocketIO, Server } from 'mock-socket';
import { ErrorService } from './error.service';
import { handlers, CHANNEL_LIST_HANDLER } from './websocket-events/websocket-events';

import { StoreModule, Store } from '@ngrx/store';
import { reducers } from '../reducers/reducers';
import { AppState } from '../reducers/app.states';
import ChatServer from '../../../shared-interfaces/server.interface';
import { JOIN_SERVER, SET_CHANNEL_LIST } from '../reducers/current-server.reducer';

// tslint:disable:no-unused-expression

describe('WebsocketService', () => {
  let injector: TestBed;
  let service: WebsocketService;
  let errorService: ErrorService;
  let mockServer: Server;
  (window as any).MockSocketIo = SocketIO;
  let store: Store<AppState>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        WebsocketService,
        ErrorService,
      ],
      imports: [
        StoreModule.forRoot(reducers),
      ]
    });
    injector = getTestBed();
    service = injector.get(WebsocketService);
    errorService = injector.get(ErrorService);
    mockServer = new Server('http://localhost:6145');
    store = injector.get(Store);
    const currentServer: ChatServer = {
      _id: '123',
      name: 'server',
      owner_id: 'asd',
    };
    store.dispatch({
      type: JOIN_SERVER,
      payload: currentServer,
    });
    spyOn(store, 'dispatch').and.callThrough();
  });
  afterEach(() => {
    mockServer.close();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
    expect(service.connected).toEqual(false);
    expect(service.socket).toBeUndefined;
  });
  it('Websocket connection fails with no token error callback', async () => {
    spyOn((window as any).MockSocketIo, 'connect').and.callFake(() => {
      return {
        on: (type, callback) => {
          if (type === 'error') {
            callback('No token provided');
          }
        }
      };
    });
    const connected = await service.connect().toPromise();
    expect(connected).toEqual(false);
    expect(service.connected).toEqual(false);
  });
  it('doesn\'t connect if already connected', async () => {
    spyOn((window as any).MockSocketIo, 'connect');
    service.connected = true;
    service.socket = { connected: true };
    const connectionResult = await service.connect().toPromise();
    expect((window as any).MockSocketIo.connect).not.toHaveBeenCalled();
    expect(connectionResult).toEqual(true);
    expect(service.socket).toBeDefined();
    expect(service.connected).toEqual(true);
  });
  it('connects to websocket', async () => {
    const connected = await service.connect().toPromise();
    expect(connected).toEqual(true);
    expect(service.socket).toBeDefined();
    expect(service.connected).toEqual(true);
  });
  it('connect and then disconnect from websocket', async (done) => {
    const connected = await service.connect().toPromise();
    expect(connected).toEqual(true);
    expect(service.socket).toBeDefined();
    expect(service.connected).toEqual(true);
    mockServer.close();
    setTimeout(() => {
      expect(service.connected).toEqual(false);
      done();
    }, 20);
  });
  it('creates errorService message on soft-error', async (done) => {
    errorService.errorMessage.subscribe((val) => {
      expect(val.message).toEqual('test message 1');
      done();
    });
    mockServer.on('connection', server => {
      mockServer.emit('soft-error', 'test message 1');
    });
    await service.connect().toPromise();
  });
  it('channel-list', () => {
    const fakeSocket = {
      on: (msg: string, callback: any) => {
        callback('success');
      }
    };
    handlers[CHANNEL_LIST_HANDLER](fakeSocket, store);
    expect(store.dispatch).toHaveBeenCalledWith({
      type: SET_CHANNEL_LIST,
      payload: 'success',
    });
  });
  it('chat-message', () => {
    // TODO
  });
});
